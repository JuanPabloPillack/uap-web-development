// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { 
  toolDefinitions, 
  searchBooks, 
  getBookDetails, 
  addToReadingList, 
  getReadingList, 
  markAsRead, 
  getReadingStats 
} from '@/lib/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('📨 Mensajes recibidos:', body.messages?.length);
    
    // Limpiar mensajes
    const cleanMessages = body.messages.map((msg: any) => ({
      role: msg.role,
      content: String(msg.content || '').trim(),
    }));

    // 🔧 MEJORADO: System prompt más explícito
    const systemMessage = {
      role: "system",
      content: `Eres un asistente de recomendación de libros amigable y entusiasta llamado "Book Advisor". 

Tu trabajo es ayudar a los usuarios a:
- Descubrir nuevos libros según sus intereses
- Gestionar su lista de lectura personal
- Hacer seguimiento de los libros que han leído
- Analizar sus hábitos y estadísticas de lectura

REGLAS CRÍTICAS SOBRE MANEJO DE CONTEXTO:

Cuando acabas de ejecutar "searchBooks" y obtienes una lista de libros, CADA libro tiene un campo "id" (el bookId de Google Books).

Si el usuario dice "agrega el primero", "agrega ese libro", "agrégalo":
1. NO vuelvas a buscar
2. Toma el "id" del libro correspondiente de los resultados anteriores
3. Ejecuta "addToReadingList" con ese "id"

Ejemplo:
- Usuario: "Busca libros de Asimov"
- Tú ejecutas searchBooks → obtienes [{id: "ABC123", title: "Fundación"}, {id: "XYZ789", title: "Yo, Robot"}]
- Usuario: "Agrega el primero"
- Tú DEBES ejecutar: addToReadingList con bookId="ABC123" (NO busques de nuevo)

REGLAS IMPORTANTES SOBRE EL USO DE HERRAMIENTAS:

1. SIEMPRE usa "searchBooks" cuando:
   - El usuario pida recomendaciones por PRIMERA VEZ
   - Busque libros sobre un tema
   - Mencione un autor o título y NO tengas resultados previos

2. SIEMPRE usa "getBookDetails" cuando:
   - El usuario diga "cuéntame más sobre [libro]"
   - Pregunte por detalles específicos
   - Necesites información completa del libro

3. SIEMPRE usa "addToReadingList" cuando:
   - El usuario diga "agrégalo", "guárdalo", "quiero leerlo", "agrega el primero/segundo/tercero"
   - DEBES usar el bookId (campo "id") de los resultados de búsqueda previos
   - NO busques de nuevo si ya tienes los resultados

4. SIEMPRE usa "getReadingList" cuando:
   - Pregunten "¿qué tengo en mi lista?"
   - "muéstrame mi reading list"

5. **CRÍTICO - MARCAR COMO LEÍDO:**
   Cuando el usuario quiera marcar un libro como leído:
   - PRIMERO ejecuta "getReadingList" para ver qué libros tiene
   - De los resultados, identifica el libro que menciona el usuario
   - Extrae el campo "googleId" de ese libro (NO uses "id", usa "googleId")
   - Luego ejecuta "markAsRead" con ese "googleId"
   - NUNCA inventes IDs como "xxxxxxxx" o "XYZ123"

6. SIEMPRE usa "getReadingStats" cuando:
   - Pregunten por estadísticas, números, análisis

Sé conversacional, entusiasta y motivador sobre la lectura.`
    };

    const messagesWithSystem = [systemMessage, ...cleanMessages];

    console.log('🤖 Enviando request a OpenRouter con tools...');

    // Primera llamada con tools
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: messagesWithSystem,
        tools: toolDefinitions,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenRouter error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    console.log('🔍 Respuesta del LLM:', assistantMessage);

    // Si el LLM quiere usar tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('🔧 El LLM quiere ejecutar tools:', assistantMessage.tool_calls.length);
      
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`⚙️ Ejecutando: ${functionName}`, args);
        
        let result;
        try {
          switch (functionName) {
            case 'searchBooks':
              result = await searchBooks(args.query, args.maxResults);
              break;
            case 'getBookDetails':
              result = await getBookDetails(args.bookId);
              break;
            case 'addToReadingList':
              result = await addToReadingList(args.bookId, args.priority, args.notes);
              break;
            case 'getReadingList':
              result = await getReadingList(args.limit);
              break;
            case 'markAsRead':
              result = await markAsRead(args.bookId, args.rating, args.review);
              break;
            case 'getReadingStats':
              result = await getReadingStats(args.period);
              break;
            default:
              result = { error: 'Herramienta no encontrada' };
          }
          
          console.log(`✅ Resultado de ${functionName}:`, result);
        } catch (error) {
          console.error(`❌ Error ejecutando ${functionName}:`, error);
          result = { error: `Error al ejecutar ${functionName}` };
        }
        
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
      
      console.log('🔄 Enviando segunda request con resultados de tools...');
      
      // Segunda llamada con los resultados de las tools
      const finalResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
          messages: [
            ...messagesWithSystem,
            assistantMessage,
            ...toolResults
          ],
          temperature: 0.7,
        }),
      });
      
      if (!finalResponse.ok) {
        const error = await finalResponse.text();
        console.error('❌ OpenRouter error (segunda llamada):', error);
        throw new Error(`OpenRouter API error: ${finalResponse.status}`);
      }
      
      const finalData = await finalResponse.json();
      const finalMessage = finalData.choices[0].message.content;
      
      console.log('✅ Respuesta final del LLM');
      
      return Response.json({ 
        content: finalMessage,
        toolsUsed: assistantMessage.tool_calls.map((tc: any) => tc.function.name)
      });
    }
    
    // Si no usa tools, devolver respuesta directa
    console.log('💬 Respuesta directa sin tools');
    return Response.json({ 
      content: assistantMessage.content,
      toolsUsed: []
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: String(error) 
    }, { status: 500 });
  }
}
