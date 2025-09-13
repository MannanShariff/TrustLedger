import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import BudgetSankeyChart from '../components/visualizations/BudgetSankeyChart';
import BudgetTreemap from '../components/visualizations/BudgetTreemap';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVisualization, setActiveVisualization] = useState('sankey');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch budgets
        const budgetsRes = await axios.get('/api/budgets');
        setBudgets(budgetsRes.data.data);
        
        // Fetch departments
        const departmentsRes = await axios.get('/api/departments');
        setDepartments(departmentsRes.data.data);
        
        // Fetch projects
        const projectsRes = await axios.get('/api/projects');
        setProjects(projectsRes.data.data);
        
        // Fetch transactions
        const transactionsRes = await axios.get('/api/transactions');
        setTransactions(transactionsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleVisualization = (type) => {
    setActiveVisualization(type);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Budgets</h2>
          <p className="text-3xl font-bold text-primary-600">{budgets.length}</p>
          <Link to="/budgets" className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block">
            View all budgets →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Departments</h2>
          <p className="text-3xl font-bold text-primary-600">{departments.length}</p>
          <Link to="/departments" className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block">
            View all departments →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Projects</h2>
          <p className="text-3xl font-bold text-primary-600">{projects.length}</p>
          <Link to="/projects" className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block">
            View all projects →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Transactions</h2>
          <p className="text-3xl font-bold text-primary-600">{transactions.length}</p>
          <Link to="/transactions" className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block">
            View all transactions →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Budget Flow Visualization</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleVisualization('sankey')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeVisualization === 'sankey' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Sankey Diagram
            </button>
            <button
              onClick={() => toggleVisualization('treemap')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeVisualization === 'treemap' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Treemap
            </button>
          </div>
        </div>

        <div className="h-96">
          {activeVisualization === 'sankey' ? (
            <BudgetSankeyChart 
              budgets={budgets} 
              departments={departments} 
              projects={projects} 
              transactions={transactions} 
            />
          ) : (
            <BudgetTreemap 
              budgets={budgets} 
              departments={departments} 
              projects={projects} 
              transactions={transactions} 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No transactions found.</p>
          )}
          <Link to="/transactions" className="text-primary-600 hover:text-primary-800 text-sm mt-4 inline-block">
            View all transactions →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Projects</h2>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h3 className="font-medium text-gray-800">{project.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Allocated: ₹{project.allocatedAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Status: {project.status}</p>
                    </div>
                    <Link to={`/projects/${project._id}`} className="text-primary-600 hover:text-primary-800 text-sm">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No projects found.</p>
          )}
          <Link to="/projects" className="text-primary-600 hover:text-primary-800 text-sm mt-4 inline-block">
            View all projects →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;