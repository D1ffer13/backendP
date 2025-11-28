// frontend/src/components/common/Table.jsx

import React from 'react';
import Button from './Button';

const Table = ({
  columns,
  data,
  onEdit,
  onDelete,
  onDetails,   // НОВОЕ: обработчик "Подробнее"
  minWidth = 0
}) => {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: minWidth || undefined
      }}
    >
      <thead>
        <tr
          style={{
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #dee2e6'
          }}
        >
          {columns.map((col) => (
            <th
              key={col.accessor}
              style={{
                padding: '10px',
                textAlign: col.align || 'left',
                whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                width: col.width ?? 'auto',
                maxWidth: col.maxWidth || 'none',
                fontSize: '13px'
              }}
            >
              {col.header}
            </th>
          ))}

          {(onEdit || onDelete || onDetails) && (
            <th
              style={{
                padding: '10px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                width: 230 // достаточно для 3 маленьких кнопок
              }}
            >
              Действия
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={row.id || rowIndex}
            style={{ borderBottom: '1px solid #eee' }}
          >
            {columns.map((col, colIndex) => {
              const content = col.render
                ? col.render(row, rowIndex)
                : row[col.accessor];

              const hasFixedWidth = Boolean(
                col.maxWidth || col.width || col.nowrap
              );

              return (
                <td
                  key={col.accessor || colIndex}
                  style={{
                    padding: '8px',
                    textAlign: col.align || 'left',
                    whiteSpace: hasFixedWidth ? 'nowrap' : 'normal',
                    maxWidth: col.maxWidth || col.width || 'none',
                    overflow: hasFixedWidth ? 'hidden' : 'visible',
                    textOverflow: hasFixedWidth ? 'ellipsis' : 'clip',
                    fontSize: '13px'
                  }}
                  title={
                    typeof content === 'string' && hasFixedWidth
                      ? content
                      : undefined
                  }
                >
                  {content}
                </td>
              );
            })}

            {(onEdit || onDelete || onDetails) && (
              <td
                style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {onDetails && (
                    <Button
                      variant="outline"
                      onClick={() => onDetails(row)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Подробнее
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => onEdit(row)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Изм.
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      onClick={() => onDelete(row)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Удалить
                    </Button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}

        {data.length === 0 && (
          <tr>
            <td
              colSpan={columns.length + (onEdit || onDelete || onDetails ? 1 : 0)}
              style={{
                padding: '12px',
                textAlign: 'center',
                color: '#777',
                fontSize: '13px'
              }}
            >
              Нет данных
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
