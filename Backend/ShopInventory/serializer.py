from rest_framework import serializers
from .models import Category, Product, Supplier, Inventory


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "created_at",
        ]


class ProductSerializer(serializers.ModelSerializer):

    initial_stock = serializers.IntegerField(
        write_only=True,
        required=False,
        default=0,
        min_value=0
    )

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
            "initial_stock",
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

class InventorySerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = Inventory
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "updated_at"
        ]
        read_only_fields = [
            "id",
            "quantity",
            "updated_at"
        ]


class StockUpdateSerializer(serializers.Serializer):

    ACTION_CHOICES = [
        ("INCREASE", "Increase"),
        ("DECREASE", "Decrease"),
    ]

    action = serializers.ChoiceField(
        choices=ACTION_CHOICES
    )

    amount = serializers.IntegerField(
        min_value=1
    )
