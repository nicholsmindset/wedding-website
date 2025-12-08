import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { photoUrl, weddingId, photoId } = await req.json()
    
    if (!photoUrl || !weddingId || !photoId) {
      throw new Error('Missing required parameters: photoUrl, weddingId, photoId')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this wedding photo in detail. Identify: 1) Key moments/events happening (ceremony, reception, first dance, etc.), 2) Emotional sentiment and atmosphere, 3) Notable objects/decorations, 4) Time of day indicators, 5) Group compositions (bride, groom, family, guests), 6) Any special traditions or cultural elements. Return a JSON object with: {"moments": [{"type": "string", "confidence": 0.95, "description": "string"}], "sentiment": "positive|neutral|negative", "key_elements": ["string"], "time_context": "string", "group_composition": "string", "special_notes": "string"}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const analysisContent = openaiData.choices[0].message.content
    
    // Parse the JSON response from OpenAI
    let analysis: any
    try {
      // Extract JSON from the response (OpenAI might wrap it in markdown)
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        analysis = JSON.parse(analysisContent)
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisContent)
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Store photo moments in database
    if (analysis.moments && Array.isArray(analysis.moments)) {
      for (const moment of analysis.moments) {
        await supabaseClient
          .from('photo_moments')
          .insert({
            wedding_id: weddingId,
            photo_id: photoId,
            moment_type: moment.type,
            confidence: moment.confidence,
            metadata: {
              description: moment.description,
              sentiment: analysis.sentiment,
              key_elements: analysis.key_elements,
              time_context: analysis.time_context,
              group_composition: analysis.group_composition,
              special_notes: analysis.special_notes
            }
          })
      }
    }

    // Generate embedding for similarity search (when pgvector is available)
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: `Wedding photo: ${analysis.moments?.map((m: any) => m.type).join(', ')} - ${analysis.sentiment} sentiment - ${analysis.key_elements?.join(', ')}`
      })
    })

    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      // Store embedding for similarity search
      await supabaseClient
        .from('embeddings')
        .insert({
          wedding_id: weddingId,
          photo_id: photoId,
          embedding: JSON.stringify(embedding) // Store as JSON until pgvector is enabled
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        momentsDetected: analysis.moments?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error analyzing photo:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})