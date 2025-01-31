import { OptionalId,ObjectId } from "mongodb";

export type restaurantModel = OptionalId<{
  nombre: string,
  direccion: string,
  ciudad: string,
  telefono: string
}>;

export type APIClima = {
    temp : string
};

export type APIZonah = {
    hour: string,
    minute: string
};

export type APIPhone = {
    is_valid: boolean
};


