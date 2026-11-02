from django.urls import path

from .views import CategoryViewSet, ProductViewSet, SupplierViewSet, AiConversation, gemini

from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'suppliers', SupplierViewSet)
urlpatterns = router.urls


urlpatterns += [
    path('ai-conversation/', AiConversation, name='ai-conversation'),  
    path('gemini/', gemini, name='gemini')
]