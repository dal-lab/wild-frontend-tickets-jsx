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
  type: string | Function, props: any, ...children: any[]
) {
  if (typeof type === 'function') {
    return type({ ...props, children });
  }

  const element = document.createElement(type);
  Object.assign(element, props);
  if (props) {
    ['click', 'submit'].forEach((event) => {
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
  status: 'open' | 'closed';
  comments: Comment[];
  toggle(): void;
}

interface Comment {
  id: number;
  text: string;
}

function Header() {
  return (
    <header>
      <h1>Tickets</h1>
    </header>
  );
}

function Main({ tickets, addTicket, addComment }: {
  tickets: Ticket[];
  addTicket: ({ title, description }: {
    title: string;
    description: string;
  }) => void;
  addComment: (ticket: Ticket) => ({ text }: {
    text: string;
  }) => void;
}) {
  return (
    <main>
      <TicketList tickets={tickets} addComment={addComment} />
      <TicketForm addTicket={addTicket} />
    </main>
  );
}

function TicketList({ tickets, addComment }: {
  tickets: Ticket[];
  addComment: (ticket: Ticket) => ({ text }: {
    text: string;
  }) => void;
}) {
  if (tickets.length === 0) {
    return <div>No tickets</div>;
  }
  return (
    <ul id="ticket-list">
      {tickets.map((ticket) => (
        <TicketItem ticket={ticket} addComment={addComment} />
      ))}
    </ul>
  );
}

function CommentList({ comments }: {
  comments: Comment[];
}) {
  if (comments.length === 0) {
    return <div className="no-comments">No comments</div>;
  }
  return (
    <ul id="comment-list">
      {comments.map((comment) => (
        <CommentItem comment={comment} />
      ))}
    </ul>
  );
}

function TicketItem({ ticket, addComment }: {
  ticket: Ticket;
  addComment: (ticket: Ticket) => ({ text }: {
    text: string;
  }) => void;
}) {
  const handleClick = () => {
    ticket.toggle();
  };

  return (
    <li>
      <div className="title">{ticket.title}</div>
      <div className="description">{ticket.description}</div>
      <button
        className="status"
        onClick={handleClick}
      >
        {ticket.status === 'open' ? 'Open' : 'Closed'}
      </button>
      <CommentList comments={ticket.comments} />
      <CommentForm addComment={(comment) => addComment(ticket)(comment)} />
    </li>
  );
}

function CommentItem({ comment }: {
  comment: Comment;
}) {
  return (
    <li>
      <div className="text">{comment.text}</div>
    </li>
  );
}

function TicketForm({ addTicket }: {
  addTicket: ({ title, description }: {
    title: string;
    description: string;
  }) => void;
}) {
  const handleSubmit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

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
      <button type="submit" id="add-ticket">Add Ticket</button>
    </form>
  );
}

function CommentForm({ addComment }: {
  addComment: ({ text }: {
    text: string;
  }) => void;
}) {
  const handleSubmit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const text = formData.get('text') as string;

    addComment({ text });
  };

  return (
    <form id="add-comment-form" onSubmit={handleSubmit}>
      <div>
        <label for="comment-text">Comment</label>
        <input type="text" name="text" id="comment-text" placeholder="Comment" />
      </div>
      <button type="submit" id="add-comment">Add Comment</button>
    </form>
  );
}

function render({ root, tickets, addTicket, addComment }: {
  root: HTMLElement;
  tickets: Ticket[];
  addTicket: ({ title, description }: {
    title: string;
    description: string;
  }) => void;
  addComment: (ticket: Ticket) => ({ text }: {
    text: string;
  }) => void;
}) {
  root.replaceChildren(
    <div>
      <Header />
      <Main tickets={tickets} addTicket={addTicket} addComment={addComment} />
    </div>
  );
}

// const root = document.getElementById('root');
if (root) {
  const tickets: Ticket[] = [];

  const update = () => {
    render({ root, tickets, addTicket, addComment });
  };

  const addTicket = ({ title, description }: {
    title: string;
    description: string;
  }) => {
    const id = Math.max(...tickets.map((ticket) => ticket.id), 0) + 1;
    const ticket: Ticket = {
      id,
      title,
      description,
      status: 'open',
      comments: [],
      toggle() {
        this.status = this.status === 'open' ? 'closed' : 'open';
        update();
      }
    };

    tickets.push(ticket);

    update();
  }

  const addComment = (ticket: Ticket) => ({ text }: {
    text: string;
  }) => {
    const id = Math.max(...ticket.comments.map((comment) => comment.id), 0) + 1;
    const comment: Comment = {
      id,
      text,
    };

    ticket.comments.push(comment);
    update();
  }

  update();
}
