import { requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { deleteProductImage, saveProductImage } from "@/lib/images";
import { createProduct, listProducts, readProductFields } from "@/lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    message: "Productos obtenidos con éxito",
    products: await listProducts(),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  let uploadedImage = "";
  try {
    const formData = await request.formData();
    const fields = readProductFields(formData);
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      uploadedImage = await saveProductImage(imageFile);
    }

    if (!fields.name || !fields.categoryId || fields.price === undefined) {
      throw Object.assign(
        new Error("Completa nombre, precio y categoría para continuar."),
        { status: 400 },
      );
    }

    const product = await createProduct({
      name: fields.name,
      description: fields.description,
      price: fields.price,
      quantity: fields.quantity,
      productType: fields.productType,
      isSoldOut: fields.isSoldOut,
      isFeatured: fields.isFeatured,
      categoryId: fields.categoryId,
      image: uploadedImage,
      portions: fields.portions,
    });

    return Response.json(
      { message: "Producto creado con éxito", product },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedImage) {
      await deleteProductImage(uploadedImage);
    }
    return errorResponse(error);
  }
}
