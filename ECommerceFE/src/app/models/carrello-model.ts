export interface OrdiniCarrello {
  id: number;
  id_utente: number;
  id_gioco: number;
  quantita: number;
}

export interface GiocoCarrello {
  id: number;
  titolo: string;
  prezzo: string | number; // Arriva come stringa dal JSON ("29.99")
  datarilascio: string;
  sviluppatore: string;
  image_url: string;
  descrizione: string;
  OrdiniCarrello: OrdiniCarrello; // Dati di giunzione (quantità)
}

export interface CarrelloDati {
  id: number;
  id_utente: number;
  giochi: GiocoCarrello[];
}

export interface CarrelloResponse {
  items: CarrelloDati[];
  totaleArticoli: number;
  subtotale: number | null;
}
