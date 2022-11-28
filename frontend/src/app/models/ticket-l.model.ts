import { Time } from "@angular/common";

export class TicketL {
    code!: number | null; //Ticket message code
    t_code!: number | null; //Ticket code
    date!: Time | null; //Ticket message date
    type!: string | null;  //Ticket message type (P or R)
    time!: string | null; //Time spent on the ticket message
    text1: string = ""; //Ticket message text 1 (765 characters) (255+255+255)
    text2: string = ""; //Ticket message text 2 (765 characters) (255+255+255)
    text3: string = ""; //Ticket message text 3 (765 characters) (255+255+255)
    file!: string | null; //Ticket message attachment
}

