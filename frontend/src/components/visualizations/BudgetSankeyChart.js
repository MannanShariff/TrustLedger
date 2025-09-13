import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const BudgetSankeyChart = ({ budgets, departments, projects, transactions }) => {
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

    // Prepare data for Sankey diagram
    const nodes = [];
    const links = [];

    // Add budget nodes
    budgets.forEach((budget, index) => {
      nodes.push({
        id: `budget-${budget._id}`,
        name: budget.name,
        type: 'budget',
        amount: budget.totalAmount
      });
    });

    // Add department nodes
    departments.forEach((department) => {
      nodes.push({
        id: `department-${department._id}`,
        name: department.name,
        type: 'department',
        amount: department.allocatedAmount
      });

      // Add links from budgets to departments
      links.push({
        source: `budget-${department.budgetId}`,
        target: `department-${department._id}`,
        value: department.allocatedAmount
      });
    });

    // Add project nodes
    projects.forEach((project) => {
      nodes.push({
        id: `project-${project._id}`,
        name: project.name,
        type: 'project',
        amount: project.allocatedAmount
      });

      // Add links from departments to projects
      links.push({
        source: `department-${project.departmentId}`,
        target: `project-${project._id}`,
        value: project.allocatedAmount
      });
    });

    // Group transactions by project
    const projectTransactions = {};
    transactions.forEach((transaction) => {
      if (!projectTransactions[transaction.projectId]) {
        projectTransactions[transaction.projectId] = 0;
      }
      projectTransactions[transaction.projectId] += transaction.amount;
    });

    // Add vendor nodes (aggregated)
    const vendorNode = {
      id: 'vendors',
      name: 'Vendors',
      type: 'vendor',
      amount: Object.values(projectTransactions).reduce((sum, amount) => sum + amount, 0)
    };
    nodes.push(vendorNode);

    // Add links from projects to vendors
    Object.entries(projectTransactions).forEach(([projectId, amount]) => {
      links.push({
        source: `project-${projectId}`,
        target: 'vendors',
        value: amount
      });
    });

    // Filter out links with missing sources or targets
    const validLinks = links.filter(link => {
      const sourceExists = nodes.some(node => node.id === link.source);
      const targetExists = nodes.some(node => node.id === link.target);
      return sourceExists && targetExists && link.value > 0;
    });

    // Create Sankey generator
    const sankeyGenerator = sankey()
      .nodeId(d => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [width, height]]);

    // Generate Sankey data
    const sankeyData = sankeyGenerator({
      nodes: nodes,
      links: validLinks.map(d => ({ ...d }))
    });

    // Color scale for nodes
    const colorScale = d3.scaleOrdinal()
      .domain(['budget', 'department', 'project', 'vendor'])
      .range(['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']);

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(sankeyData.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => d3.color(colorScale(d.source.type)).darker(0.5))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n₹${d.value.toLocaleString()}`);

    // Draw nodes
    const nodes_g = svg.append('g')
      .selectAll('rect')
      .data(sankeyData.nodes)
      .enter()
      .append('g');

    nodes_g.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', d => d3.color(colorScale(d.type)).darker(0.5))
      .append('title')
      .text(d => `${d.name}\n₹${d.amount.toLocaleString()}`);

    // Add node labels
    nodes_g.append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none')
      .attr('fill', '#333');

  }, [budgets, departments, projects, transactions]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default BudgetSankeyChart;