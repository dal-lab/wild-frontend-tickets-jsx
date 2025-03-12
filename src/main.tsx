import { createElement } from "./utils/jsx";

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "closed";
  toggle(): void;
}

function Header() {
  return (
    <header>
      <h1>Tickets</h1>
    </header>
  );
}

function Main({
  tickets,
  addTicket,
}: {
  tickets: Ticket[];
  addTicket: ({ title, description }: { title: string; description: string }) => void;
}) {
  return (
    <main>
      <TicketList tickets={tickets} />
      <TicketForm addTicket={addTicket} />
    </main>
  );
}

function TicketList({ tickets }: { tickets: Ticket[] }) {
  return (
    <ul id="ticket-list">
      {tickets.map((ticket) => (
        <TicketItem ticket={ticket} />
      ))}
    </ul>
  );
}

function TicketItem({ ticket }: { ticket: Ticket }) {
  const handleClick = () => {
    ticket.toggle();
  };

  return (
    <li>
      <div className="title">{ticket.title}</div>
      <div className="description">{ticket.description}</div>
      <button className="status" onClick={handleClick}>
        {ticket.status === "open" ? "Open" : "Closed"}
      </button>
    </li>
  );
}

function TicketForm({
  addTicket,
}: {
  addTicket: ({ title, description }: { title: string; description: string }) => void;
}) {
  const handleSubmit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    addTicket({ title, description });
  };

  return (
    <form id="add-ticket-form" onSubmit={handleSubmit}>
      <div>
        <label for="ticket-title">Title</label>
        <input type="text" name="title" id="ticket-title" placeholder="Title" />
      </div>
      <div>
        <label for="ticket-description">Description</label>
        <textarea name="description" id="ticket-description" placeholder="Description"></textarea>
      </div>
      <button type="submit" id="add-ticket">
        Add Ticket
      </button>
    </form>
  );
}

function render({
  root,
  tickets,
  addTicket,
}: {
  root: HTMLElement;
  tickets: Ticket[];
  addTicket: ({ title, description }: { title: string; description: string }) => void;
}) {
  root.replaceChildren(
    <div>
      <Header />
      <Main tickets={tickets} addTicket={addTicket} />
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  const tickets: Ticket[] = [];

  const update = () => {
    render({ root, tickets, addTicket });
  };

  const addTicket = ({ title, description }: { title: string; description: string }) => {
    const id = Math.max(...tickets.map((ticket) => ticket.id), 0) + 1;
    const ticket: Ticket = {
      id,
      title,
      description,
      status: "open",
      toggle() {
        this.status = this.status === "open" ? "closed" : "open";
        update();
      },
    };

    tickets.push(ticket);

    update();
  };

  update();
}
