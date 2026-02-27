import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from "../api";
import "./PlacementAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function PlacementAnalytics() {
  const [departmentStats, setDepartmentStats] = useState([]);
  const [overviewStats, setOverviewStats] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedYear]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch department-wise statistics
      const deptResponse = await api.get(`/placement/department-stats/${user.id}`);
      setDepartmentStats(deptResponse.data);

      // Fetch overview statistics
      const overviewResponse = await api.get(`/placement/overview/${user.id}`);
      setOverviewStats(overviewResponse.data);

      // Fetch yearly trend data
      const trendResponse = await api.get(`/placement/yearly-trend/${user.id}`);
      setYearlyTrend(trendResponse.data);

    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Bar Chart: Department vs Placement %
  const departmentChartData = {
    labels: departmentStats.map(dept => dept.department || 'Unknown'),
    datasets: [
      {
        label: 'Placement Percentage',
        data: departmentStats.map(dept => parseFloat(dept.placement_percentage) || 0),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(17, 153, 142, 0.8)',
          'rgba(56, 239, 125, 0.8)',
          'rgba(250, 112, 154, 0.8)',
          'rgba(254, 225, 64, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(17, 153, 142, 1)',
          'rgba(56, 239, 125, 1)',
          'rgba(250, 112, 154, 1)',
          'rgba(254, 225, 64, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const departmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Department-wise Placement Percentage',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Placement: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Placement Percentage',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Departments',
        }
      }
    },
  };

  // Pie Chart: Placed vs Unplaced
  const placementPieData = {
    labels: ['Placed', 'Unplaced'],
    datasets: [
      {
        data: [
          parseInt(overviewStats.students_placed) || 0,
          parseInt(overviewStats.students_unplaced) || 0,
        ],
        backgroundColor: [
          'rgba(56, 239, 125, 0.8)',
          'rgba(250, 112, 154, 0.8)',
        ],
        borderColor: [
          'rgba(56, 239, 125, 1)',
          'rgba(250, 112, 154, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        }
      },
      title: {
        display: true,
        text: 'Placement Status Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(2);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Line Chart: Yearly Placement Trend
  const yearlyTrendData = {
    labels: yearlyTrend.map(item => item.year),
    datasets: [
      {
        label: 'Placement Percentage',
        data: yearlyTrend.map(item => parseFloat(item.placement_percentage) || 0),
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Students Placed',
        data: yearlyTrend.map(item => parseInt(item.students_placed) || 0),
        borderColor: 'rgba(56, 239, 125, 1)',
        backgroundColor: 'rgba(56, 239, 125, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(56, 239, 125, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          padding: 15,
        }
      },
      title: {
        display: true,
        text: 'Placement Trend Over Years',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count / Percentage',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
        }
      }
    },
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="placement-analytics">
      <div className="analytics-header">
        <div>
          <h2>Placement Analytics & Visualization</h2>
          <p>Comprehensive placement statistics and trends</p>
        </div>
        <div className="year-filter">
          <label>Filter by Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Overall Placement Rate</h3>
          <div className="big-number">{overviewStats.placement_percentage || 0}%</div>
          <p>{overviewStats.students_placed || 0} out of {overviewStats.eligible_students || 0} students</p>
        </div>
        <div className="summary-card">
          <h3>Average Package</h3>
          <div className="big-number">₹ {overviewStats.avg_package || 0}</div>
          <p>LPA</p>
        </div>
        <div className="summary-card">
          <h3>Highest Package</h3>
          <div className="big-number">₹ {overviewStats.highest_package || 0}</div>
          <p>LPA</p>
        </div>
        <div className="summary-card">
          <h3>Multiple Offers</h3>
          <div className="big-number">{overviewStats.multiple_offers || 0}</div>
          <p>Students with 2+ offers</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-container">
          <div className="chart-wrapper">
            <Bar data={departmentChartData} options={departmentChartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-container">
          <div className="chart-wrapper pie-chart">
            <Pie data={placementPieData} options={pieChartOptions} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="chart-container full-width">
          <div className="chart-wrapper">
            <Line data={yearlyTrendData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Department Details Table */}
      <div className="department-details">
        <h3>Department-wise Detailed Statistics</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Students</th>
              <th>Eligible</th>
              <th>Placed</th>
              <th>Placement %</th>
              <th>Avg Package</th>
              <th>Highest Package</th>
            </tr>
          </thead>
          <tbody>
            {departmentStats.map((dept, index) => (
              <tr key={index}>
                <td>{dept.department || 'Unknown'}</td>
                <td>{dept.total_students}</td>
                <td>{dept.eligible_students}</td>
                <td>{dept.students_placed}</td>
                <td>
                  <span className="percentage-badge">
                    {parseFloat(dept.placement_percentage).toFixed(2)}%
                  </span>
                </td>
                <td>₹ {dept.avg_package || 0} LPA</td>
                <td>₹ {dept.highest_package || 0} LPA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlacementAnalytics;
