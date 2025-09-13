import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BudgetTreemap = ({ budgets, departments, projects, transactions }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!budgets.length || !departments.length || !projects.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare hierarchical data for treemap
    const hierarchyData = {
      name: 'Budget Allocation',
      children: budgets.map(budget => ({
        name: budget.name,
        value: budget.totalAmount,
        children: departments
          .filter(dept => dept.budgetId === budget._id)
          .map(dept => ({
            name: dept.name,
            value: dept.allocatedAmount,
            children: projects
              .filter(proj => proj.departmentId === dept._id)
              .map(proj => {
                // Calculate spent amount for this project
                const projectTransactions = transactions.filter(t => t.projectId === proj._id);
                const spentAmount = projectTransactions.reduce((sum, t) => sum + t.amount, 0);
                
                return {
                  name: proj.name,
                  value: proj.allocatedAmount,
                  spent: spentAmount,
                  remaining: proj.allocatedAmount - spentAmount
                };
              })
          }))
      }))
    };

    // Create hierarchy and treemap layout
    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapLayout = d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(1)
      .round(true);

    treemapLayout(root);

    // Color scales
    const colorScale = d3.scaleOrdinal()
      .domain(['budget', 'department', 'project'])
      .range(['#0ea5e9', '#8b5cf6', '#10b981']);

    // Create nodes
    const nodes = svg.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    nodes
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        if (d.depth === 0) return '#f3f4f6';
        if (d.depth === 1) return colorScale('budget');
        if (d.depth === 2) return colorScale('department');
        return colorScale('project');
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', d => 1 - (d.depth * 0.1))
      .append('title')
      .text(d => {
        if (d.depth === 0) return d.data.name;
        if (d.depth === 3) {
          return `${d.data.name}\nAllocated: ₹${d.data.value.toLocaleString()}\nSpent: ₹${d.data.spent.toLocaleString()}\nRemaining: ₹${d.data.remaining.toLocaleString()}`;
        }
        return `${d.data.name}\nAmount: ₹${d.data.value.toLocaleString()}`;
      });

    // Add text labels
    nodes
      .filter(d => d.depth < 4) // Only add text for the first 3 levels
      .append('text')
      .attr('x', 3)
      .attr('y', d => d.depth === 0 ? 14 : 14)
      .attr('font-size', d => {
        if (d.depth === 0) return '14px';
        if (d.depth === 1) return '12px';
        return '10px';
      })
      .attr('font-weight', d => d.depth < 2 ? 'bold' : 'normal')
      .attr('fill', d => d.depth < 2 ? '#fff' : '#333')
      .text(d => {
        const width = d.x1 - d.x0;
        const name = d.data.name;
        if (width < 50) return name.substring(0, 3) + '...';
        if (width < 100) return name.substring(0, 6) + '...';
        return name;
      })
      .append('title')
      .text(d => d.data.name);

    // Add amount labels for leaf nodes (projects)
    nodes
      .filter(d => d.depth === 3 && (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 30)
      .append('text')
      .attr('x', 3)
      .attr('y', 30)
      .attr('font-size', '9px')
      .attr('fill', '#333')
      .text(d => `₹${d.data.value.toLocaleString()}`);

  }, [budgets, departments, projects, transactions]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BudgetTreemap;