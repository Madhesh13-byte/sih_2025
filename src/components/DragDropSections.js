import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiMove } from 'react-icons/fi';

const DragDropSections = ({ sections, onReorder, children }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {sections.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      marginBottom: '16px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: snapshot.isDragging 
                        ? '0 8px 16px rgba(0,0,0,0.15)' 
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: snapshot.isDragging 
                        ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                        : provided.draggableProps.style?.transform
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div {...provided.dragHandleProps} style={{ 
                        cursor: 'grab',
                        color: '#6b7280',
                        marginRight: '12px'
                      }}>
                        <FiMove />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {section.title}
                      </h3>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {children[section.id]}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDropSections;