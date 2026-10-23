import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

import { outlineHeadings, parseMarkdownLite, type MdBlock, type MdInline } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/**
 * Renders Veer's text (blog posts, guides, industry articles) from the safe
 * Markdown subset. Never injects HTML. `anchors` gives each "## " heading the
 * id from outlineHeadings(), for a table of contents.
 */
export function Markdown({
  source,
  className,
  anchors = false,
}: {
  source: string;
  className?: string;
  anchors?: boolean;
}) {
  const blocks = parseMarkdownLite(source);
  const ids = anchors
    ? new Map(outlineHeadings(blocks).map((heading) => [heading.index, heading.id]))
    : null;
  return (
    <div className={cn("prose-fw", className)}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} id={ids?.get(index)} />
      ))}
    </div>
  );
}

function Block({ block, id }: { block: MdBlock; id?: string | undefined }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 id={id} className={id ? "scroll-mt-28" : undefined}>
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
    case "table":
      return (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {block.header.map((cell, index) => (
                  <th key={index} scope="col">
                    <Inline nodes={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, index) => (
                    <td key={index}>
                      <Inline nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
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
