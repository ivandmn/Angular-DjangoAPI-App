import { Time } from "@angular/common";
export class TicketL {
    code!: number | null; //Codigo mensaje del ticket
    t_code!: number | null; //Codigo de ticket
    date!: Time | null; //Fecha del mensaje del ticket
    type!: string | null;  //Tipo de mensaje (P o R)
    time!: string | null; //Tiempo empleado en el mensaje
    text1: string = ""; //Texto 1 del mesnaje del ticket (765 caracteres) (255+255+255)
    text2: string = ""; //Texto 2 del mesnaje del ticket (765 caracteres) (255+255+255)
    text3: string = ""; //Texto 3 del mesnaje del ticket (765 caracteres) (255+255+255)
    file!: string | null; //F.adjunto del mensaje del ticket
}

