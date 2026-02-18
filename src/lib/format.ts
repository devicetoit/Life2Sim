const oneDecimalFormatter = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 0,
});

export function formatAmount(value: number): string {
    return oneDecimalFormatter.format(value);
}

export function formatInteger(value: number): string {
    return integerFormatter.format(value);
}
