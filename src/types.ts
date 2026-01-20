
export interface Property {
    id: string;
    address: string;
    purchase_date: string | null;
    price: number | null;
    created_at: string;
}

export interface Tenant {
    id: string;
    property_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    lease_start: string | null;
    lease_end: string | null;
    rent_amount: number;
    created_at: string;
    property?: Property;
}

export interface Payment {
    id: string;
    tenant_id: string;
    amount: number;
    payment_date: string;
    payment_type: 'rent' | 'deposit' | 'other';
    notes: string | null;
    created_at: string;
    tenant?: Tenant;
}

export interface Expense {
    id: string;
    property_id: string;
    amount: number;
    expense_date: string;
    category: string;
    description: string | null;
    receipt_url: string | null;
    created_at: string;
    property?: Property;
}
