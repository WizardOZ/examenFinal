import { Collection, ObjectId } from "mongodb";
import {  restaurantModel ,APIClima,APIZonah, APIPhone} from "./types.ts";
import { GraphQLError} from "graphql"

type Context = {
  restaurantCollection: Collection<restaurantModel>;
}
const API_KEY = "OM5JKKx8hBVW2MdbRefj1A==yLbGfkLL4rZtWDaQ";
export const resolvers = {
  Restaurant: {
      id: (parent: restaurantModel) => parent._id!.toString(),
      hora: async (parent: restaurantModel): Promise<string> => {
          const API_KEY = Deno.env.get("API_KEY");
          if (!API_KEY) throw new Error("No API key provided")
          const url = "https://api.api-ninjas.com/v1/worldtime?city=" + parent.ciudad
          const data = await fetch(url, {
              headers: {
                  'X-Api-Key': API_KEY
              },
          });
          if (data.status !== 200) throw new GraphQLError("Error al llamar a la API de la hora")
          const response: APIZonah = await data.json()
          return response.hour + ":" +response.minute

      },
      temperatura: async (parent: restaurantModel): Promise<string> => {
        const API_KEY = Deno.env.get("API_KEY");
        if (!API_KEY) throw new Error("No API key provided")
        const url = "https://api.api-ninjas.com/v1/weather?city=" + parent.ciudad
        const data = await fetch(url, {
            headers: {
                'X-Api-Key': API_KEY
            },
        });
        if (data.status !== 200) throw new GraphQLError("Error al llamar a la API de la hora")
        const response: APIClima = await data.json()
        return response.temp

    }
  },
  Query: {
      getRestaurant: async (_: unknown, args: { id: string }, ctx: Context): Promise<restaurantModel | null> => {
          return await ctx.restaurantCollection.findOne({ _id: new ObjectId(args.id) })
      },
      getRestaurants: async (_: unknown, __: unknown, ctx: Context): Promise<restaurantModel[]> => {
          return await ctx.restaurantCollection.find().toArray()
      }

  },
  Mutation:{
    addRestaurant: async (_: unknown, args : { nombre: string, direccion: string, ciudad: string, telefono:string}, ctx: Context): Promise<restaurantModel> =>{
        console.log("Hola")
      //Verificamos que no haya un resaturante con ese numero
      const userExists = await ctx.restaurantCollection.findOne({ telefono: args.telefono })
      if (userExists) throw new GraphQLError("Ya hay un usuario registrado con ese teléfono")
        console.log("Restaurante validacion 1")
      //Verificamos que sea correcto el numero de telefono
      const API_KEY = Deno.env.get("API_KEY");
        if (!API_KEY) throw new Error("No API key provided")
        const url = "https://api.api-ninjas.com/v1/validatephone?number=" + args.telefono
        const data = await fetch(url, {
          headers: {
                'X-Api-Key': API_KEY
            },
          });

        if (data.status !== 200) throw new GraphQLError("Error al llamar a la API de validación.")
        const response: APIPhone = await data.json()
        if (!response.is_valid) throw new GraphQLError("El telefono es incorrecto.")
            console.log("Restaurante validacion 2")
        //Pasamos todas las validaciones asi que guardamos
        const { insertedId } = await ctx.restaurantCollection.insertOne({
          nombre: args.nombre,
          telefono: args.telefono,
          direccion: args.direccion,
          ciudad: args.ciudad
      })

      console.log("Restaurante craeado")
      return {
          _id : insertedId!.toString(),
          nombre: args.nombre,
          telefono: args.telefono,
          direccion: args.direccion,
          ciudad: args.ciudad,
      }

  },
  deleteRestaurant: async (_: unknown, args: { id: string }, ctx: Context): Promise<boolean> => {
    const { deletedCount } = await ctx.restaurantCollection.deleteOne({ _id: new ObjectId(args.id) })
    return deletedCount === 1;
},

  }
}
