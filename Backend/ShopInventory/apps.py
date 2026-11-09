from django.apps import AppConfig


class ShopinventoryConfig(AppConfig):
    name = 'ShopInventory'

    def ready(self):
        import ShopInventory.signals
