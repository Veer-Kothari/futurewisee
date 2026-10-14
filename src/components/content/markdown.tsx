import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

import { parseMarkdownLite, type MdBlock, type MdInline } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/** Renders Veer's text (blog posts, guides) from the safe Markdown subset. Never injects HTML. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdownLite(source);
  return (
    <div className={cn("prose-fw", className)}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: MdBlock }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2>
          <Inline nodes={block.children} />
        </h2>
      ) : (
        <h3>
          <Inline nodes={block.children} />
        </h3>
      );
    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index}>
          <Inline nodes={item} />
        </li>
      ));
      return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "quote":
      return (
        <blockquote>
          <Inline nodes={block.children} />
        </blockquote>
      );
    default:
      return (
        <p>
          <Inline nodes={block.children} />
        </p>
      );
  }
}

function Inline({ nodes }: { nodes: MdInline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "strong":
            return (
              <strong key={index}>
                <Inline nodes={node.children} />
              </strong>
            );
          case "em":
            return (
              <em key={index}>
                <Inline nodes={node.children} />
              </em>
            );
          case "link":
            return node.href.startsWith("/") ? (
              <Link key={index} to={node.href}>
                <Inline nodes={node.children} />
              </Link>
            ) : (
              <a
                key={index}
                href={node.href}
                {...(node.href.startsWith("mailto:")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <Inline nodes={node.children} />
              </a>
            );
          default:
            return <Fragment key={index}>{node.text}</Fragment>;
        }
      })}
    </>
  );
}
