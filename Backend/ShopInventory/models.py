from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products"
    )

    name = models.CharField(max_length=200)


    description = models.TextField(blank=True)

    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))]
    )

    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))]
    )

    minimum_stock = models.PositiveIntegerField(
        default=5
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)

    phone = models.CharField(
        max_length=30,
        blank=True
    )

    email = models.EmailField(
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


# class Customer(models.Model):
#     name = models.CharField(max_length=200)

#     phone = models.CharField(
#         max_length=30,
#         blank=True
#     )

#     email = models.EmailField(
#         blank=True
#     )

#     address = models.TextField(
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return self.name


class Inventory(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory"
    )

    quantity = models.PositiveIntegerField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"


# class Purchase(models.Model):

#     class Status(models.TextChoices):
#         PENDING = "PENDING", "Pending"
#         COMPLETED = "COMPLETED", "Completed"
#         CANCELLED = "CANCELLED", "Cancelled"

#     supplier = models.ForeignKey(
#         Supplier,
#         on_delete=models.PROTECT,
#         related_name="purchases"
#     )

#     purchase_date = models.DateTimeField(
#         auto_now_add=True
#     )

#     total_amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=Status.choices,
#         default=Status.PENDING
#     )

#     def __str__(self):
#         return f"Purchase #{self.id}"


# class PurchaseItem(models.Model):

#     purchase = models.ForeignKey(
#         Purchase,
#         on_delete=models.CASCADE,
#         related_name="items"
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.PROTECT,
#         related_name="purchase_items"
#     )

#     quantity = models.PositiveIntegerField()

#     unit_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         validators=[MinValueValidator(Decimal("0.00"))]
#     )

#     @property
#     def subtotal(self):
#         return self.quantity * self.unit_price

#     def __str__(self):
#         return f"{self.product.name} - {self.quantity}"


# class Sale(models.Model):

#     class PaymentMethod(models.TextChoices):
#         CASH = "CASH", "Cash"
#         CARD = "CARD", "Card"
#         BANK = "BANK", "Bank Transfer"
#         OTHER = "OTHER", "Other"

#     class Status(models.TextChoices):
#         COMPLETED = "COMPLETED", "Completed"
#         CANCELLED = "CANCELLED", "Cancelled"

#     customer = models.ForeignKey(
#         Customer,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name="sales"
#     )

#     sale_date = models.DateTimeField(
#         auto_now_add=True
#     )

#     total_amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     payment_method = models.CharField(
#         max_length=20,
#         choices=PaymentMethod.choices,
#         default=PaymentMethod.CASH
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=Status.choices,
#         default=Status.COMPLETED
#     )

#     def __str__(self):
#         return f"Sale #{self.id}"


# class SaleItem(models.Model):

#     sale = models.ForeignKey(
#         Sale,
#         on_delete=models.CASCADE,
#         related_name="items"
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.PROTECT,
#         related_name="sale_items"
#     )

#     quantity = models.PositiveIntegerField()

#     unit_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         validators=[MinValueValidator(Decimal("0.00"))]
#     )

#     @property
#     def subtotal(self):
#         return self.quantity * self.unit_price

#     def __str__(self):
#         return f"{self.product.name} - {self.quantity}"


# class StockMovement(models.Model):

#     class MovementType(models.TextChoices):
#         PURCHASE = "PURCHASE", "Purchase"
#         SALE = "SALE", "Sale"
#         RETURN = "RETURN", "Return"
#         DAMAGE = "DAMAGE", "Damage"
#         ADJUSTMENT = "ADJUSTMENT", "Adjustment"

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.PROTECT,
#         related_name="stock_movements"
#     )

#     movement_type = models.CharField(
#         max_length=20,
#         choices=MovementType.choices
#     )

#     quantity = models.IntegerField()

#     notes = models.TextField(
#         blank=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return (
#             f"{self.product.name} - "
#             f"{self.movement_type} - "
#             f"{self.quantity}"
#         )