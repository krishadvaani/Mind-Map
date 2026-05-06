// Default mind map tree structure
const defaultData = {
  id: 'root',
  label: 'Main Idea',
  shape: 'custom-rounded',
  color: null,
  collapsed: false,
  children: [
    {
      id: 'branch-1',
      label: 'Concept & Importance',
      shape: 'rounded',
      color: null,
      collapsed: false,
      children: [
        { id: 'leaf-1a', label: 'Definition', shape: 'rounded', color: null, collapsed: false, children: [] },
        { id: 'leaf-1b', label: 'Key Benefits', shape: 'rounded', color: null, collapsed: false, children: [] },
        { id: 'leaf-1c', label: 'Use Cases', shape: 'rounded', color: null, collapsed: false, children: [] },
      ],
    },
    {
      id: 'branch-2',
      label: 'Categories',
      shape: 'rounded',
      color: null,
      collapsed: false,
      children: [
        {
          id: 'sub-2a',
          label: 'Type A',
          shape: 'rounded',
          color: null,
          collapsed: false,
          children: [
            { id: 'leaf-2a1', label: 'Feature 1', shape: 'rounded', color: null, collapsed: false, children: [] },
            { id: 'leaf-2a2', label: 'Feature 2', shape: 'rounded', color: null, collapsed: false, children: [] },
          ],
        },
        {
          id: 'sub-2b',
          label: 'Type B',
          shape: 'rounded',
          color: null,
          collapsed: false,
          children: [
            { id: 'leaf-2b1', label: 'Feature 1', shape: 'rounded', color: null, collapsed: false, children: [] },
            { id: 'leaf-2b2', label: 'Feature 2', shape: 'rounded', color: null, collapsed: false, children: [] },
          ],
        },
      ],
    },
    {
      id: 'branch-3',
      label: 'Implementation',
      shape: 'rounded',
      color: null,
      collapsed: false,
      children: [
        { id: 'leaf-3a', label: 'Step 1', shape: 'rounded', color: null, collapsed: false, children: [] },
        { id: 'leaf-3b', label: 'Step 2', shape: 'rounded', color: null, collapsed: false, children: [] },
        { id: 'leaf-3c', label: 'Step 3', shape: 'rounded', color: null, collapsed: false, children: [] },
      ],
    },
  ],
};

export default defaultData;
