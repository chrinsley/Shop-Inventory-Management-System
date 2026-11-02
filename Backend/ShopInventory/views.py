from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.db.models import Value
from django.db.models.functions import Coalesce
from .models import Category, Product, Supplier
from .serializer import (
    CategorySerializer,
    ProductSerializer,
    SupplierSerializer,
)
from rest_framework import status
from rest_framework.response import Response
from google import genai
import json
from groq import Groq
import re
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("_API_KEY")
client = genai.Client(api_key=api_key)
# GEMINI_MODEL = "gemini-3.1-flash-live-preview"  # use a model that actually exists
client = Groq(
    api_key=api_key,
)

# ── Standard CRUD viewsets ────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


# ── Database context helpers ──────────────────────────────────────────────────

def _fetch_db_context(question: str) -> str:
    """
    Decide which tables are relevant to the question and fetch a concise
    JSON snapshot to pass to the LLM as context.

    Returns an empty string when the question seems unrelated to the database.
    """
    q = question.lower()

    # Keywords that suggest each domain
    wants_products  = any(w in q for w in ["product", "item", "stock", "price", "inventory", "sku"])
    wants_categories = any(w in q for w in ["category", "categories", "type", "group"])
    wants_suppliers  = any(w in q for w in ["supplier", "vendor", "supply", "manufacturer", "contact"])

    if not (wants_products or wants_categories or wants_suppliers):
        return ""   # Not a DB question — let the LLM answer from its own knowledge

    parts = []

    if wants_categories or wants_products:
        cats = list(Category.objects.values("id", "name"))
        if cats:
            parts.append(f"Categories ({len(cats)} total):\n" + json.dumps(cats, default=str))

    if wants_products:
        products = list(
            Product.objects
            .select_related("category")
            .annotate(stock=Coalesce("inventory__quantity", Value(0)))
            .values("id", "name", "selling_price", "stock", "category__name")
            [:50]   # cap to avoid huge prompts
        )
        if products:
            parts.append(f"Products ({len(products)} shown, may be truncated):\n" + json.dumps(products, default=str))

    if wants_suppliers:
        suppliers = list(Supplier.objects.values("id", "name", "email", "phone")[:30])
        if suppliers:
            parts.append(f"Suppliers ({len(suppliers)} shown):\n" + json.dumps(suppliers, default=str))

    return "\n\n".join(parts)


def _build_prompt(question: str, db_context: str) -> str:
    """Combine the user question with optional DB context into a final prompt."""
    if db_context:
        return (
            "You are a helpful assistant for an inventory management system. "
            "Answer the user's question using ONLY the database records provided below. "
            "Be concise and accurate. If the answer is not in the data, say so clearly.\n\n"
            f"--- DATABASE RECORDS ---\n{db_context}\n--- END RECORDS ---\n\n"
            f"User question: {question}"
        )
    else:
        return (
            "You are a helpful general-purpose assistant. "
            "Answer the following question to the best of your ability.\n\n"
            f"User question: {question}"
        )


# ── AI conversation endpoint ──────────────────────────────────────────────────

@api_view(["POST"])
def AiConversation(request):
    """
    POST /api/ai/chat/
    Body: { "message": "How many products are in stock?" }

    Flow:
      1. Inspect the question for DB-related keywords.
      2. If relevant → fetch a live DB snapshot → inject into the prompt.
      3. Send the enriched prompt to Gemini and return the answer.
    """
    question = (request.data.get("message") or "").strip()

    if not question:
        return Response(
            {"error": "message is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # 1. Pull relevant DB records (empty string if not a DB question)
        db_context = _fetch_db_context(question)

        # 2. Build the prompt
        prompt = _build_prompt(question, db_context)

        # 3. Call Gemini  ← correct google-genai SDK usage
        
        chat_completion = client.chat.completions.create(
            messages=[

                 {
            "role": "system",
            "content": (
                "You are an inventory management assistant. "
                "When database records are provided, use them to "
                "answer questions about expenses, suppliers, budgets and "
                "categories. Do not tell the user to run SQL queries. "
                "If the records do not contain the answer, say so."
            ),
        },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
           
            model="openai/gpt-oss-20b",
        )

        answer = chat_completion.choices[0].message.content

        return Response(
            {
                "message": answer,
                "used_db_context": bool(db_context),   # handy for debugging
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['POST'])
def gemini(request):
    question = request.data.get('message')
    client = genai.Client()
    interaction = client.interactions.create(
    model="gemini-3.8-flash",
    input=question
)


    return Response(
                {
                    "message": interaction.output_text,
                   
                },
                status=status.HTTP_200_OK,
            )