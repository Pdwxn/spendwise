export type ID = string;

export type ISODateString = string;

export type MonthKey = `${number}-${string}`;

export type HexColor = `#${string}`;

export type TransactionType = "income" | "expense";

export type SavingMode = "static" | "annualPercentage";

export type SavingAction = "contribution" | "withdrawal";

export type Account = {
  id: ID;
  name: string;
  initialBalance: number;
  color: HexColor;
  createdAt: ISODateString;
};

export type Category = {
  id: ID;
  name: string;
  emoji: string;
  color: HexColor;
  createdAt: ISODateString;
};

export type Transaction = {
  id: ID;
  type: TransactionType;
  amount: number;
  categoryId: ID;
  description: string;
  date: ISODateString;
  accountId: ID;
  createdAt: ISODateString;
  linkedSavingId?: ID;
  linkedSavingAction?: SavingAction;
};

export type Budget = {
  id: ID;
  categoryId: ID;
  month: MonthKey;
  amount: number;
  createdAt: ISODateString;
};

export type Saving = {
  id: ID;
  name: string;
  initialAmount: number;
  mode: SavingMode;
  annualPercentage?: number;
  createdAt: ISODateString;
};

export type SavingContribution = {
  id: ID;
  savingId: ID;
  accountId: ID;
  amount: number;
  description: string;
  date: ISODateString;
  createdAt: ISODateString;
};

export type SavingWithdrawal = {
  id: ID;
  savingId: ID;
  accountId: ID;
  amount: number;
  description: string;
  date: ISODateString;
  createdAt: ISODateString;
};

export type FinanceState = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: Saving[];
  savingContributions: SavingContribution[];
  savingWithdrawals: SavingWithdrawal[];
  selectedMonth: MonthKey;
  selectedCategoryId: ID | null;
};

export type CreateAccountInput = Pick<Account, "name" | "initialBalance" | "color">;
export type UpdateAccountInput = Partial<CreateAccountInput>;

export type CreateCategoryInput = Pick<Category, "name" | "emoji" | "color">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateTransactionInput = Pick<
  Transaction,
  "type" | "amount" | "categoryId" | "description" | "date" | "accountId"
>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type CreateBudgetInput = Pick<Budget, "categoryId" | "month" | "amount">;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;

export type CreateSavingInput = Pick<Saving, "name" | "initialAmount" | "mode"> & {
  annualPercentage?: number;
  accountId?: ID;
};
export type UpdateSavingInput = Partial<CreateSavingInput>;
