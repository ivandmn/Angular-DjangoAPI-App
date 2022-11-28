import { Time } from "@angular/common";

export class TicketH {
    code!: number | null; //Ticket Code
    date!: Date | null; //Ticket creation date
    title!: string | null; //Ticket title
    user!: string | null; //Ticket user
    manager!: string | null; //Ticket manager
    category!: string | null //Ticket category
    priority!: string | null; //Ticket priority
    state!: string | null; //Ticket state (A, C)
    position!: number | null; //Ticket position
    time!: Time | null; //Time spent by the manager on the ticket
    validation!: number | null; //Ticket validation, 0 if it is the manager's turn to respond 1 if the user's turn is to respond
    viewed!: number | null; //It is to know if the person has opened the message
    last_response_type!: string | null; //Variable to know who the last message is from
}

