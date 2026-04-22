import { z } from 'zod';
import { ai } from '@/ai/genkit';

const InputSchema = z.object({
  date: z.string(),
  totalSalesAmount: z.number(),
  numberOfTransactions: z.number(),
  averageTransactionValue: z.number(),
  topSellingProducts: z.array(z.string()),
  leastSellingProducts: z.array(z.string()),
  totalDiscountsApplied: z.number(),
  paymentMethodBreakdown: z.record(z.number()),
  newCustomersCount: z.number(),
  repeatCustomersCount: z.number(),
});

const OutputSchema = z.object({
  summary: z.string(),
});

export const dailySalesInsightsSummary = ai.defineFlow(
  {
    name: 'dailySalesInsightsSummary',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    return {
      summary: `On ${input.date}, total sales were Rs. ${input.totalSalesAmount.toLocaleString()} across ${input.numberOfTransactions} transactions. Top products: ${input.topSellingProducts.slice(0, 3).join(', ')}.`,
    };
  }
);
