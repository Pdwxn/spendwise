from django.contrib import admin
from .models import Account, Budget, Category, Saving, SavingContribution, SavingWithdrawal, Transaction


admin.site.register(Account)
admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(Budget)
admin.site.register(Saving)
admin.site.register(SavingContribution)
admin.site.register(SavingWithdrawal)
