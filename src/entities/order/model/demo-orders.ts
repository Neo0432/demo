export interface DemoOrder {
  id: string;
  client: string;
  status: "new" | "processing" | "done" | "blocked";
  amount: number;
  createdAt: string;
}

export const demoOrders: DemoOrder[] = [
  {
    id: "ORD-1042",
    client: "ООО Север",
    status: "processing",
    amount: 128400,
    createdAt: "2026-06-11",
  },
  {
    id: "ORD-1041",
    client: "Мария Н.",
    status: "done",
    amount: 32100,
    createdAt: "2026-06-09",
  },
  {
    id: "ORD-1040",
    client: "Demo Lab",
    status: "new",
    amount: 76500,
    createdAt: "2026-06-08",
  },
  {
    id: "ORD-1039",
    client: "ИП Волков",
    status: "blocked",
    amount: 18400,
    createdAt: "2026-06-06",
  },
];
