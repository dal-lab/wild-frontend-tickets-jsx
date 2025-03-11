/* @jsx createElement */

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createElement(
  type: string | Function,
  props: any,
  ...children: any[]
) {
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  const element = document.createElement(type);
  Object.assign(element, props);
  if (props) {
    ["click", "submit"].forEach((event) => {
      const handler = props[`on${capitalize(event)}`];
      if (handler) {
        element.addEventListener(event, handler);
      }
    });
  }
  children.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((childItem) => element.append(childItem));
      return;
    }
    element.append(child);
  });
  return element;
}

interface IComment {
  id: number;
  comment: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "closed";
  toggle(): void;
  comments: IComment[];
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
  addComment,
}: {
  tickets: Ticket[];
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  addComment: (comment: string, ticketId: number) => void;
}) {
  return (
    <main>
      <TicketForm addTicket={addTicket} />
      <TicketList tickets={tickets} addComment={addComment} />
    </main>
  );
}

function CommentList({ comments }: { comments: IComment[] }) {
  return (
    <div id="comments">
      {comments.map((comment) => (
        <div className="comment-item" key={comment.id}>
          {comment.comment}
        </div>
      ))}
    </div>
  );
}

function CommentForm({
  addComment,
  ticketId,
}: {
  addComment: (comment: string, ticketId: number) => void;
  ticketId: number;
}) {
  const handleAddComment = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const comment = formData.get("comment") as string;

    addComment(comment, ticketId);
  };

  return (
    <form id="add-comment-form" onSubmit={handleAddComment}>
      <div>
        <label htmlFor="comment">Add a comment</label>
        <input type="text" name="comment" id="comment" />
      </div>
      <button type="submit">Add Comment</button>
    </form>
  );
}

function TicketList({
  tickets,
  addComment,
}: {
  tickets: Ticket[];
  addComment: (comment: string, ticketId: number) => void;
}) {
  return (
    <ul id="ticket-list">
      {tickets.map((ticket) => (
        <TicketItem ticket={ticket} addComment={addComment} />
      ))}
    </ul>
  );
}

function TicketItem({
  ticket,
  addComment,
}: {
  ticket: Ticket;
  addComment: (comment: string, ticketId: number) => void;
}) {
  const handleClick = () => {
    ticket.toggle();
  };

  return (
    <li>
      <div className="title">{ticket.title}</div>
      <div className="description">{ticket.description}</div>
      <button className="status" onClick={handleClick}>
        {ticket.status === "open" ? "댓글창 닫기" : "댓글창 열기"}
      </button>
      {ticket.status === "open" ? (
        <div id="comments">
          <CommentForm addComment={addComment} ticketId={ticket.id} />
          <CommentList comments={ticket.comments} />
        </div>
      ) : (
        ""
      )}
    </li>
  );
}

function TicketForm({
  addTicket,
}: {
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
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
        <textarea
          name="description"
          id="ticket-description"
          placeholder="Description"
        ></textarea>
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
  addComment,
}: {
  root: HTMLElement;
  tickets: Ticket[];
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  addComment: (comment: string, ticketId: number) => void;
}) {
  root.replaceChildren(
    <div>
      <Header />
      <Main tickets={tickets} addTicket={addTicket} addComment={addComment} />
    </div>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    const tickets: Ticket[] = [];

    const update = () => {
      render({ root, tickets, addTicket, addComment });
    };

    const addTicket = ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
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
        comments: [],
      };

      tickets.push(ticket);
      update();
    };

    const addComment = (comment: string, ticketId: number) => {
      const ticket = tickets.find((ticket) => ticket.id === ticketId);
      if (ticket) {
        ticket.comments = [
          ...ticket.comments,
          {
            id: Math.max(...ticket.comments.map((c) => c.id), 0) + 1,
            comment,
          },
        ];
        update();
      }
    };

    update();
  }
});
