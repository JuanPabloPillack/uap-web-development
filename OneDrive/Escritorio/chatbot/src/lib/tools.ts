// src/lib/tools.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================================
// DEFINICIONES DE TOOLS PARA EL LLM
// ========================================

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "searchBooks",
      description: "Busca libros en Google Books por título, autor, o tema. Usa esta herramienta cuando el usuario pida recomendaciones o quiera buscar libros.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda (título, autor, tema, palabras clave)"
          },
          maxResults: {
            type: "number",
            description: "Número máximo de resultados (default: 10)",
            default: 10
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getBookDetails",
      description: "Obtiene información detallada de un libro específico usando su Google Books ID. Usa esta herramienta SIEMPRE que el usuario pregunte por detalles, información completa, o diga 'cuéntame más sobre [libro]'.",
      parameters: {
        type: "object",
        properties: {
          bookId: {
            type: "string",
            description: "ID único de Google Books del libro"
          }
        },
        required: ["bookId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "addToReadingList",
      description: "Agrega un libro a la lista 'Quiero Leer' del usuario. Usa esta herramienta cuando el usuario diga que quiere leer un libro, que lo agregue a su lista, o que lo guarde.",
      parameters: {
        type: "object",
        properties: {
          bookId: {
            type: "string",
            description: "ID único de Google Books del libro"
          },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "Prioridad del libro (opcional)"
          },
          notes: {
            type: "string",
            description: "Notas personales del usuario sobre el libro (opcional)"
          }
        },
        required: ["bookId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getReadingList",
      description: "Obtiene la lista de libros pendientes por leer del usuario. Usa esta herramienta cuando el usuario pregunte qué libros tiene en su lista o qué le falta leer.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Número máximo de libros a retornar (default: 20)",
            default: 20
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "markAsRead",
      description: "Marca un libro como leído y opcionalmente agrega rating/review. Usa esta herramienta cuando el usuario diga que terminó un libro, que ya lo leyó, o que lo quiere marcar como leído.",
      parameters: {
        type: "object",
        properties: {
          bookId: {
            type: "string",
            description: "ID único de Google Books del libro"
          },
          rating: {
            type: "number",
            description: "Calificación de 1-5 estrellas (opcional)",
            minimum: 1,
            maximum: 5
          },
          review: {
            type: "string",
            description: "Review personal del usuario (opcional)"
          }
        },
        required: ["bookId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getReadingStats",
      description: "Genera estadísticas de lectura del usuario. Usa esta herramienta cuando el usuario pregunte por sus estadísticas, cuántos libros ha leído, sus géneros favoritos, etc.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["all-time", "year", "month"],
            description: "Periodo de tiempo para las estadísticas (default: all-time)",
            default: "all-time"
          }
        }
      }
    }
  }
];

// ========================================
// IMPLEMENTACIONES DE LAS TOOLS
// ========================================

export async function searchBooks(query: string, maxResults: number = 10) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults * 2}`; // 🔧 Pedimos más para filtrar
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return { books: [], message: "No se encontraron libros para esa búsqueda." };
    }
    
    // 🔧 NUEVO: Filtrar libros con IDs problemáticos
    const validBooks = data.items.filter((item: any) => {
      const hasBasicInfo = item.volumeInfo && item.volumeInfo.title && item.id;
      const isNotProblematicId = !item.id.includes('AAAMAAJ') && !item.id.includes('AAAQBAJ');
      return hasBasicInfo && isNotProblematicId;
    }).slice(0, maxResults); // Limitar al número solicitado
    
    const books = validBooks.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors?.join(', ') || 'Autor desconocido',
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
      description: item.volumeInfo.description?.substring(0, 200) || 'Sin descripción'
    }));
    
    return { books, count: books.length };
  } catch (error) {
    console.error('Error en searchBooks:', error);
    return { error: 'Error al buscar libros', books: [] };
  }
}

export async function getBookDetails(bookId: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.volumeInfo) {
      return { error: "Libro no encontrado" };
    }
    
    return {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors?.join(', ') || 'Autor desconocido',
      description: data.volumeInfo.description || 'Sin descripción',
      pageCount: data.volumeInfo.pageCount || 0,
      categories: data.volumeInfo.categories?.join(', ') || 'Sin categoría',
      thumbnail: data.volumeInfo.imageLinks?.thumbnail || null,
      publishedDate: data.volumeInfo.publishedDate || 'Fecha desconocida',
      averageRating: data.volumeInfo.averageRating || 'Sin rating',
    };
  } catch (error) {
    console.error('Error en getBookDetails:', error);
    return { error: 'Error al obtener detalles del libro' };
  }
}

export async function addToReadingList(bookId: string, priority?: string, notes?: string) {
  try {
    // 🔧 MEJORADO: Intentar obtener info del libro
    const bookInfo = await getBookDetails(bookId);
    
    if ('error' in bookInfo) {
      console.log('⚠️ BookId no válido o libro no disponible:', bookId);
      return { 
        error: "No se pudo agregar el libro. El libro no está disponible en este momento.",
        suggestion: "Por favor, intenta buscar el libro de nuevo y selecciona otro resultado."
      };
    }
    
    const item = await prisma.readingListItem.create({
      data: {
        googleId: bookId,
        title: bookInfo.title,
        authors: bookInfo.authors,
        thumbnail: bookInfo.thumbnail,
        priority: priority || 'medium',
        notes: notes || null
      }
    });
    
    return { 
      success: true, 
      message: `✅ "${bookInfo.title}" agregado a tu lista de lectura`,
      book: item
    };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { 
        success: false,
        error: "Este libro ya está en tu lista de lectura" 
      };
    }
    console.error('Error en addToReadingList:', error);
    return { 
      success: false,
      error: 'Error al agregar libro a la lista. Por favor, intenta de nuevo.' 
    };
  }
}

export async function getReadingList(limit: number = 20) {
  try {
    const items = await prisma.readingListItem.findMany({
      take: limit,
      orderBy: { addedAt: 'desc' }
    });
    
    return {
      books: items,
      count: items.length
    };
  } catch (error) {
    console.error('Error en getReadingList:', error);
    return { error: 'Error al obtener lista de lectura', books: [] };
  }
}

// 🔧 CAMBIO 2: Función markAsRead MEJORADA
export async function markAsRead(bookId: string, rating?: number, review?: string) {
  try {
    // 🔧 NUEVO: Primero buscar si el libro está en la reading list
    const bookInList = await prisma.readingListItem.findFirst({
      where: { googleId: bookId }
    });
    
    let bookInfo;
    
    if (bookInList) {
      // Si está en la lista, usar esa info (evita llamar a Google Books API)
      console.log('✅ Usando info del libro desde reading list');
      bookInfo = {
        title: bookInList.title,
        authors: bookInList.authors || 'Autor desconocido',
        thumbnail: bookInList.thumbnail,
        pageCount: 0 // No lo tenemos en reading list, pero no es crítico
      };
    } else {
      // Si no está en la lista, intentar obtenerlo de Google Books
      console.log('🔍 Libro no en lista, obteniendo de Google Books...');
      const details = await getBookDetails(bookId);
      
      if ('error' in details) {
        return { 
          success: false,
          error: "No se pudo marcar el libro como leído. El libro no está disponible." 
        };
      }
      
      bookInfo = {
        title: details.title,
        authors: details.authors,
        thumbnail: details.thumbnail,
        pageCount: details.pageCount || 0
      };
    }
    
    // Agregar a libros leídos
    const readBook = await prisma.readBook.create({
      data: {
        googleId: bookId,
        title: bookInfo.title,
        authors: bookInfo.authors,
        thumbnail: bookInfo.thumbnail,
        pageCount: bookInfo.pageCount,
        rating: rating || null,
        review: review || null
      }
    });
    
    // Remover de reading list si existe
    await prisma.readingListItem.deleteMany({
      where: { googleId: bookId }
    });
    
    return {
      success: true,
      message: `✅ "${bookInfo.title}" marcado como leído`,
      book: readBook
    };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { 
        success: false,
        error: "Este libro ya fue marcado como leído anteriormente" 
      };
    }
    console.error('Error en markAsRead:', error);
    return { 
      success: false,
      error: 'Error al marcar libro como leído' 
    };
  }
}

export async function getReadingStats(period: string = 'all-time') {
  try {
    const books = await prisma.readBook.findMany();
    
    const totalBooks = books.length;
    const totalPages = books.reduce((sum, book) => sum + (book.pageCount || 0), 0);
    const booksWithRating = books.filter(b => b.rating);
    const avgRating = booksWithRating.length > 0 
      ? booksWithRating.reduce((sum, b) => sum + (b.rating || 0), 0) / booksWithRating.length 
      : 0;
    
    // Contar autores
    const authors = books.map(b => b.authors).filter(Boolean);
    const authorCounts: Record<string, number> = {};
    authors.forEach(author => {
      if (author) authorCounts[author] = (authorCounts[author] || 0) + 1;
    });
    
    return {
      totalBooksRead: totalBooks,
      totalPages: totalPages,
      averageRating: avgRating.toFixed(1),
      topAuthors: Object.entries(authorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([author, count]) => ({ author, count }))
    };
  } catch (error) {
    console.error('Error en getReadingStats:', error);
    return { error: 'Error al obtener estadísticas' };
  }
}