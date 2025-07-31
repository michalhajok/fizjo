import React from "react";

const Table = ({
  children,
  className = "",
  striped = false,
  hover = false,
  bordered = false,
  compact = false,
}) => {
  const baseClasses = `
    w-full text-sm text-left text-gray-500
    ${striped ? "table-striped" : ""}
    ${hover ? "table-hover" : ""}
    ${bordered ? "border border-gray-200" : ""}
    ${compact ? "table-compact" : ""}
    ${className}
  `;

  return (
    <div className="overflow-x-auto">
      <table className={baseClasses}>{children}</table>
    </div>
  );
};

const TableHead = ({ children, className = "" }) => (
  <thead className={`text-xs text-gray-700 uppercase bg-gray-50 ${className}`}>
    {children}
  </thead>
);

const TableBody = ({ children, className = "" }) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({
  children,
  className = "",
  onClick,
  selected = false,
  hover = true,
}) => (
  <tr
    className={`
      ${selected ? "bg-blue-50" : "bg-white"}
      ${hover ? "hover:bg-gray-50" : ""}
      ${onClick ? "cursor-pointer" : ""}
      border-b border-gray-200
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableHeader = ({
  children,
  className = "",
  sortable = false,
  sortDirection = null,
  onSort,
}) => (
  <th
    scope="col"
    className={`
      px-6 py-3 font-medium text-gray-900 tracking-wider
      ${sortable ? "cursor-pointer hover:bg-gray-100" : ""}
      ${className}
    `}
    onClick={sortable ? onSort : undefined}
  >
    <div className="flex items-center">
      {children}
      {sortable && (
        <div className="ml-2">
          {sortDirection === "asc" ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          ) : sortDirection === "desc" ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12l-4-4h8l-4 4z" />
            </svg>
          )}
        </div>
      )}
    </div>
  </th>
);

const TableCell = ({
  children,
  className = "",
  align = "left",
  header = false,
}) => {
  const Tag = header ? "th" : "td";
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag
      className={`
        px-6 py-4 whitespace-nowrap
        ${alignClasses[align]}
        ${header ? "font-medium text-gray-900" : "text-gray-500"}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

const TableCaption = ({ children, className = "" }) => (
  <caption className={`py-2 text-sm text-gray-500 ${className}`}>
    {children}
  </caption>
);

const TableFooter = ({ children, className = "" }) => (
  <tfoot className={`text-xs text-gray-700 uppercase bg-gray-50 ${className}`}>
    {children}
  </tfoot>
);

// Composite components
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;
Table.Caption = TableCaption;
Table.Footer = TableFooter;

export default Table;
