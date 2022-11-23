import { Time } from "@angular/common";

export class TicketH {
    code!: number | null; //Codigo ticket
    date!: Date | null; //f_alta ticket
    title!: string | null; //titulo ticket
    user!: string | null; // usuario ticket
    manager!: string | null; //gestor ticket
    category!: string | null //categoria ticket
    priority!: string | null; //prioridad ticket
    state!: string | null; //estado ticket (A o C)
    position!: number | null; //Posición ticket
    time!: Time | null; //tiempo empleado por el gestor en el ticket
    validation!: number | null; //validacion 0 si le toca responder al gestor 1 si le toca responder al usuario
    viewed!: number | null; //Es para saber si la persona ha abierto el mensaje
    last_response_type!: string | null; //Variable para saber de quien es el ulimo mensaje
}

