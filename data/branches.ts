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
  { id: "kl-midvalley", name: "Mid Valley Branch", lat: 3.1186, lng: 101.6773, address: "Lingkaran Syed Putra, Kuala Lumpur" },
  { id: "kl-bangsar", name: "Bangsar Branch", lat: 3.1292, lng: 101.6743, address: "Jalan Telawi, Bangsar, KL" },
  { id: "kl-ttdi", name: "TTDI Branch", lat: 3.1412, lng: 101.6294, address: "Taman Tun Dr Ismail, Kuala Lumpur" },
  { id: "kl-montkiara", name: "Mont Kiara Branch", lat: 3.1652, lng: 101.6524, address: "Jalan Kiara, Mont Kiara, KL" },
  { id: "kl-kepong", name: "Kepong Branch", lat: 3.2120, lng: 101.6395, address: "Metro Prima, Kepong, KL" },
  { id: "kl-setapak", name: "Setapak Branch", lat: 3.1932, lng: 101.7332, address: "Jalan Genting Kelang, Setapak, KL" },
  { id: "kl-cheras", name: "Cheras Branch", lat: 3.0826, lng: 101.7371, address: "Taman Connaught, Cheras, KL" },
  { id: "kl-bukitjalil", name: "Bukit Jalil Branch", lat: 3.0587, lng: 101.6828, address: "Pusat Perdagangan Bandar Bukit Jalil, KL" },
  { id: "selangor-pj", name: "Petaling Jaya Branch", lat: 3.1073, lng: 101.6067, address: "Section 14, Petaling Jaya, Selangor" },
  { id: "selangor-bu", name: "Bandar Utama Branch", lat: 3.1478, lng: 101.6169, address: "1 Utama, Bandar Utama, Selangor" },
  { id: "selangor-subang", name: "Subang Jaya Branch", lat: 3.0738, lng: 101.5883, address: "SS15, Subang Jaya, Selangor" },
  { id: "selangor-puchong", name: "Puchong Branch", lat: 3.0333, lng: 101.6167, address: "Bandar Puteri, Puchong, Selangor" },
  { id: "selangor-ampang", name: "Ampang Point Branch", lat: 3.1584, lng: 101.7486, address: "Ampang Point, Ampang, Selangor" },
];