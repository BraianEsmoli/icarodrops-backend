import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const productos = response.results.map(page => ({
      nombre: page.properties.Producto?.title?.[0]?.plain_text || 'Sin nombre',
      imagen: page.properties["Imagen producto"]?.files?.[0]?.file?.url || '',
      descripcion: page.properties.Descripcion?.rich_text?.[0]?.plain_text || 'Sin descripción',
      talles: page.properties.Talles?.rich_text?.[0]?.plain_text || '-',
      precio: page.properties.Precio?.number || 0,
      agotado: page.properties.Estado?.select?.name === 'Agotado'
    }));

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos desde Notion:", error);
    res.status(500).json({ error: "Error al obtener productos desde Notion" });
  }
}
