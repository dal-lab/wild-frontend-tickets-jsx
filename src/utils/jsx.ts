export function createElement(type: string | Function, props: any, ...children: any[]) {
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  const element = document.createElement(type);
  Object.assign(element, props);

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on") && typeof value === "function") {
        const event = key.slice(2).toLocaleLowerCase();
        element.addEventListener(event, value as EventListener);
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
