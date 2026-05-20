export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  sku: string;
}

const categories = [
  'Ração',
  'Petiscos',
  'Acessórios',
  'Higiene',
  'Saúde',
  'Camas e Casinhas',
  'Brinquedos',
  'Coleiras e Guias',
];

const imageIds = [
  'photo-1587300003388-59208cc962cb',
  'photo-1548199973-03cce0bbc87b',
  'photo-1560743173-567a3b5658b1',
  'photo-1518717758536-85ae29035b6d',
  'photo-1544568100-847a948585b9',
  'photo-1601758125946-6ec2ef64daf8',
  'photo-1516734212186-a967f81ad0d7',
  'photo-1558618666-fcd25c85cd64',
  'photo-1477884213360-7e9d7dcc1e48',
  'photo-1530281700549-e82e7bf110d6',
];

function generateProduct(index: number): Product {
  const category = categories[index % categories.length];
  const basePrice = 29.9 + (index * 7.3) % 200;
  const hasDiscount = index % 3 === 0;
  const imageId = imageIds[index % imageIds.length];

  const productNames: Record<string, string[]> = {
    'Ração': [
      'Ração Premium Adulto 15kg',
      'Ração Filhote Sabor Frango 10kg',
      'Ração Natural Fresh 3kg',
      'Ração Sênior Light 7kg',
      'Ração Úmida Sachê 100g',
    ],
    'Petiscos': [
      'Petisco Ossinho Médio 500g',
      'Bifinho de Frango 200g',
      'Snack Dental Clean 300g',
      'Palito de Couro Bovino',
      'Petisco Natural Desidratado',
    ],
    'Acessórios': [
      'Bebedouro Automático 2L',
      'Comedouro Inox Duplo',
      'Transportadora G Luxo',
      'Mochila Transporte Respirável',
      'Placa de Identificação Personalizada',
    ],
    'Higiene': [
      'Shampoo Neutro Cães 500ml',
      'Condicionador Pelos Longos 300ml',
      'Perfume Pet Colônia 100ml',
      'Tapete Higiênico 30un',
      'Lenço Umedecido Pet 100un',
    ],
    'Saúde': [
      'Suplemento Articular Flex 60 cáps',
      'Vitamina E + Biotina 30 comp',
      'Pasta Dental Pet Sabor Carne',
      'Anti-pulgas Spot On',
      'Coleira Antipulgas 8 meses',
    ],
    'Camas e Casinhas': [
      'Cama Pelúcia Ortopédica M',
      'Casinha Madeira Pintada P',
      'Colchonete Impermeável G',
      'Cama Donut Ultra Soft',
      'Casinha Plástica Externo M',
    ],
    'Brinquedos': [
      'Bola Interativa LED',
      'Corda Mordedor Colorida',
      'Osso Borracha Natural',
      'Brinquedo Kong Recheável M',
      'Túnel Gatinho Dobrável',
    ],
    'Coleiras e Guias': [
      'Coleira Ajustável Nylon M',
      'Guia Retrátil 5m',
      'Peitoral Anti-puxão P',
      'Conjunto Coleira + Guia Couro',
      'Guia Dupla Adestramento',
    ],
  };

  const names = productNames[category];
  const nameIndex = Math.floor(index / categories.length) % names.length;
  const name = `${names[nameIndex]} #${index + 1}`;

  return {
    id: `product-${String(index + 1).padStart(3, '0')}`,
    sku: `SKU-${String((index + 1) * 1337).padStart(6, '0')}`,
    name,
    category,
    price: Math.round(basePrice * 100) / 100,
    originalPrice: hasDiscount ? Math.round(basePrice * 1.2 * 100) / 100 : undefined,
    imageUrl: `https://images.unsplash.com/${imageId}?w=400&h=400&fit=crop&q=80`,
    rating: 3.5 + (index % 5) * 0.3,
    reviewCount: 12 + (index * 17) % 340,
    inStock: index % 9 !== 0,
    description: `${name}. Produto de alta qualidade para o bem-estar do seu pet. Fabricado com materiais selecionados e aprovado por veterinários. Ideal para pets da categoria ${category.toLowerCase()}.`,
  };
}

// 100-item catalog — realistic for a mid-size pet e-commerce
export const products: Product[] = Array.from({ length: 100 }, (_, i) => generateProduct(i));

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}
