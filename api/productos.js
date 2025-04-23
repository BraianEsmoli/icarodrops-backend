// api/productos.js

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  // Permitir CORS para tu dominio
  res.setHeader("Access-Control-Allow-Origin", "https://icarodrops.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight request
  }

  try {
    const response = await notion.databases.query({ database_id: databaseId });

    const productos = response.results.map(page => {
      return {
        nombre: page.properties.Producto.title[0]?.plain_text || 'Sin nombre',
        imagen: page.properties["Imagen producto"].files[0]?.file?.url || '',
        descripcion: page.properties.Descripción.rich_text[0]?.plain_text || '',
        talles: page.properties.Talles.rich_text[0]?.plain_text || '-',
        precio: `$${page.properties.Precio.number || 0}`,
        agotado: page.properties.Estado.select?.name === 'Agotado'
      };
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos desde Notion:", error);
    res.status(500).json({ error: "Error al obtener productos desde Notion" });
  }
}
