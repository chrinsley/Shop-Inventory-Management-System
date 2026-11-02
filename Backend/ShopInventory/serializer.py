from rest_framework import serializers
from .models import Category, Product, Supplier


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "created_at",
        ]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "name",
            "description",
            "purchase_price",
            "selling_price",
            "minimum_stock",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        purchase_price = data.get("purchase_price")
        selling_price = data.get("selling_price")

        if (
            purchase_price is not None
            and selling_price is not None
            and selling_price < purchase_price
        ):
            raise serializers.ValidationError({
                "selling_price": "Selling price cannot be lower than purchase price."
            })

        return data


class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "created_at",
        ]
