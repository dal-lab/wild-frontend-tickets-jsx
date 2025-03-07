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
  comments,
  addTicket,
  addComment,
}: {
  tickets: Ticket[];
  comments: Reply[];
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  addComment: ({
    parentId,
    content,
  }: {
    parentId: number;
    content: string;
  }) => void;
}) {
  return (
    <main>
      <TicketList
        tickets={tickets}
        comments={comments}
        addComment={addComment}
      />
      <TicketForm addTicket={addTicket} />
    </main>
  );
}

function TicketList({
  tickets,
  comments,
  addComment,
}: {
  tickets: Ticket[];
  comments: Reply[];
  addComment: ({
    parentId,
    content,
  }: {
    parentId: number;
    content: string;
  }) => void;
}) {
  return (
    <ul id="ticket-list">
      {tickets.map((ticket) => (
        <TicketItem
          ticket={ticket}
          comments={comments}
          addComment={addComment}
        />
      ))}
    </ul>
  );
}

interface Reply {
  id: number;
  parentId: number;
  content: string;
}

function CommentItem({
  parentId,
  comments,
}: {
  parentId: number;
  comments: Reply[];
}) {
  return (
    <ul>
      {comments
        .filter((comment) => comment.parentId === parentId)
        .map((comment) => (
          <li key={comment.id}>
            <div className="comment-content">{comment.content}</div>
          </li>
        ))}
    </ul>
  );
}

function TicketItem({
  ticket,
  comments,
  addComment,
}: {
  ticket: Ticket;
  comments: Reply[];
  addComment: ({
    parentId,
    content,
  }: {
    parentId: number;
    content: string;
  }) => void;
}) {
  const handleClick = () => {
    ticket.toggle();
  };

  const handleAddComment = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const comment = formData.get("comment") as string;

    addComment({ parentId: ticket.id, content: comment });
  };

  return (
    <li>
      <div className="title">{ticket.title}</div>
      <div className="description">{ticket.description}</div>
      <button className="status" onClick={handleClick}>
        {ticket.status === "open" ? "Open" : "Closed"}
      </button>
      <form id="add-ticket-comment" onSubmit={handleAddComment}>
        <h3>Reply</h3>
        {comments.length > 0 ? (
          <CommentItem parentId={ticket.id} comments={comments} />
        ) : (
          <div style={{ display: "none" }}></div>
        )}
        <div>
          <input
            type="text"
            name="comment"
            id="ticket-comment"
            placeholder="Reply..."
          />
        </div>
        <button type="submit" id="add-comment">
          Add Reply
        </button>
      </form>
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
  comments,
  addTicket,
  addComment,
}: {
  root: HTMLElement;
  tickets: Ticket[];
  comments: Reply[];
  addTicket: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => void;
  addComment: ({
    parentId,
    content,
  }: {
    parentId: number;
    content: string;
  }) => void;
}) {
  root.replaceChildren(
    <div>
      <Header />
      <Main
        tickets={tickets}
        comments={comments}
        addTicket={addTicket}
        addComment={addComment}
      />
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  const tickets: Ticket[] = [];
  const comments: Reply[] = [];

  const update = () => {
    render({ root, tickets, comments, addTicket, addComment });
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
    };

    tickets.push(ticket);

    update();
  };

  const addComment = ({
    parentId,
    content,
  }: {
    parentId: number;
    content: string;
  }) => {
    const id = Math.max(...comments.map((comment) => comment.id), 0) + 1;
    const comment: Reply = {
      id,
      parentId,
      content,
    };

    comments.push(comment);

    update();
  };

  update();
}
