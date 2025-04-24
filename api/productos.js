import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://icarodrops.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const response = await notion.databases.query({ database_id: databaseId });

    const productos = response.results.map(page => {
      const nombre = page.properties?.Producto?.title?.[0]?.plain_text || 'Sin nombre';

      const imagenes = page.properties?.["Imagen producto"]?.files?.map(f => 
        f.file?.url || f.external?.url
      ) || [];

      const descripcion = page.properties?.Descripción?.rich_text?.[0]?.plain_text || 'Sin descripción';
      const talles = page.properties?.Talles?.rich_text?.[0]?.plain_text || '-';
      const precio = `$${page.properties?.Precio?.number ?? 0}`;
      const agotado = page.properties?.Estado?.select?.name === 'Agotado';

      return {
        nombre,
        imagen: imagenes[0] || '',
        imagenes,
        descripcion,
        talles,
        precio,
        agotado
      };
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos desde Notion:", error);
    res.status(500).json({ error: "Error al obtener productos desde Notion" });
  }
}
