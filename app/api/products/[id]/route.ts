import { requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { deleteProductImage, saveProductImage } from "@/lib/images";
import {
  getProductById,
  readProductFields,
  removeProduct,
  updateProduct,
} from "@/lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return Response.json({ message: "Producto no encontrado" }, { status: 404 });
  }
  return Response.json({ message: "Producto obtenido con éxito", product });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  let uploadedImage: string | undefined;

  try {
    const formData = await request.formData();
    const fields = readProductFields(formData, true);
    const imageFile = formData.get("image");
    const current = await getProductById(id);

    if (!current) {
      return Response.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      uploadedImage = await saveProductImage(imageFile);
    }

    const product = await updateProduct(id, {
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

    if (uploadedImage && current.image) {
      await deleteProductImage(current.image);
    }

    return Response.json({
      message: "Producto actualizado con éxito",
      product,
    });
  } catch (error) {
    if (uploadedImage) {
      await deleteProductImage(uploadedImage);
    }
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    await removeProduct(id);
    return Response.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    return errorResponse(error);
  }
}
