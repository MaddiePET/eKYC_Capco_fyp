export interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export const BRANCHES: Branch[] = [
  { id: "kl-main", name: "KL Main Branch", lat: 3.1390, lng: 101.6869, address: "Bukit Bintang, Kuala Lumpur" },
  { id: "kl-klcc", name: "KLCC Branch", lat: 3.1579, lng: 101.7116, address: "Jalan Ampang, Kuala Lumpur" },
  { id: "selangor-bu", name: "Bandar Utama Branch", lat: 3.1478, lng: 101.6169, address: "1 Utama, Bandar Utama, Selangor" },
  { id: "selangor-subang", name: "Subang Jaya Branch", lat: 3.0738, lng: 101.5883, address: "SS15, Subang Jaya, Selangor" },
  { id: "selangor-puchong", name: "Puchong Branch", lat: 3.0333, lng: 101.6167, address: "Bandar Puteri, Puchong, Selangor" },
];