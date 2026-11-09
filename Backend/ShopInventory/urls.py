from django.urls import path

from .views import CategoryViewSet, InventoryListAPIView, ProductViewSet, SupplierViewSet, AiConversation, gemini, UpdateInventoryStockAPIView

from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'suppliers', SupplierViewSet)
urlpatterns = router.urls


urlpatterns += [
    path('ai-conversation/', AiConversation, name='ai-conversation'),  
    path('gemini/', gemini, name='gemini'),
     path(
        "inventory/",
        InventoryListAPIView.as_view(),
        name="inventory-list",
    ),

    # POST increase/decrease stock
    path(
        "inventory/<int:pk>/update-stock/",
        UpdateInventoryStockAPIView.as_view(),
        name="update-inventory-stock",
    ),
]