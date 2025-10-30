import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/apiService.js';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, Sector 
} from 'recharts';

// Component for a custom Active Pie Chart slice
const ActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={14} fontWeight="bold">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`₹${value.toLocaleString()}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate: ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await analyticsAPI.getAnalytics();
                setAnalyticsData(response.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError(err.response?.data?.message || 'Failed to load analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const PIE_COLORS = ['#80A1BA', '#91C4C3', '#B4DEBD', '#E5E9C5'];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF7DD] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#80A1BA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating your analytics report...</p>
                </div>
            </div>
        );
    }

    if (error || !analyticsData?.keyStats) {
        return (
            <div className="min-h-screen bg-[#FFF7DD] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="text-yellow-500 text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Analytics Data</h2>
                    <p className="text-gray-600 mb-6">{error || 'You must have at least one filed return to view analytics.'}</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#80A1BA] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#6d8da4] transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF7DD]">
            <header className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center text-gray-500 hover:text-[#80A1BA] transition-colors font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tax Analytics</h1>
                                <p className="text-sm text-gray-500">Your financial insights over time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Filings" value={analyticsData.keyStats.totalFilings} />
                    <StatCard title="Total Tax Paid" value={`₹${analyticsData.keyStats.totalTaxPaid.toLocaleString()}`} />
                    <StatCard title="Total Refunds" value={`₹${analyticsData.keyStats.totalRefunds.toLocaleString()}`} />
                    <StatCard title="Average Tax Rate" value={`${analyticsData.keyStats.averageTaxRate}%`} />
                </div>

                {/* Income Trend Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Income & Tax Trend</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analyticsData.incomeTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="year" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="totalIncome" fill="#80A1BA" name="Total Income" />
                            <Bar dataKey="taxPaid" fill="#91C4C3" name="Tax Paid" />
                            <Bar dataKey="refund" fill="#B4DEBD" name="Refund" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Deduction Breakdown Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Deduction Breakdown ({analyticsData.deductionBreakdown.year})
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={ActiveShape}
                                data={analyticsData.deductionBreakdown.data}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={140}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {analyticsData.deductionBreakdown.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </main>
        </div>
    );
};

// Helper component for the Stats Cards
const StatCard = ({ title, value }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <p className="text-3xl font-bold text-[#80A1BA]">{value}</p>
    </div>
);

// Helper component for the Bar Chart Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
                <p className="font-bold text-gray-800">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.name}: ₹${entry.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default AnalyticsPage;