import { LineGraph } from "../components/graphs/LineGraph";

// Data generation functions
const generateTimeSeriesData = (days, baseValue, variance) => {
  return Array.from({ length: days }, (_, i) => ({
    timestamp: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000),
    value: Math.floor(Math.random() * variance) + baseValue,
  }));
};

const getSampleArticleData = () => [
  { title: "Understanding React Hooks", views: 12847 },
  { title: "JavaScript Best Practices 2024", views: 9632 },
  { title: "CSS Grid vs Flexbox", views: 8421 },
  { title: "Node.js Performance Tips", views: 7234 },
  { title: "TypeScript Advanced Types", views: 6891 },
  { title: "Database Design Patterns", views: 5672 },
  { title: "API Security Guidelines", views: 4523 },
  { title: "Docker Container Optimization", views: 3456 },
  { title: "GraphQL vs REST API", views: 2341 },
  { title: "Microservices Architecture", views: 1892 },
  { title: "Git Workflow Strategies", views: 1654 },
  { title: "Testing Strategies Overview", views: 1423 },
  { title: "DevOps Pipeline Setup", views: 1298 },
  { title: "Code Review Best Practices", views: 987 },
  { title: "Debugging Techniques", views: 856 },
];

const getTopAndBottomPerformers = (articles, count = 5) => {
  const topPerformers = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, count);

  const bottomPerformers = [...articles]
    .sort((a, b) => a.views - b.views)
    .slice(0, count);

  return { topPerformers, bottomPerformers };
};

const getEntityQueueData = () => [
  {
    type: "Author Profiles",
    count: 23,
    priority: "high",
    description: "Author bio and profile information",
    urgentCount: 8,
  },
  {
    type: "Article Topics",
    count: 45,
    priority: "medium",
    description: "Topic categorization and tagging",
    urgentCount: 12,
  },
  {
    type: "Publication Sources",
    count: 17,
    priority: "high",
    description: "External publication source verification",
    urgentCount: 6,
  },
  {
    type: "Content Categories",
    count: 31,
    priority: "low",
    description: "Content classification and taxonomy",
    urgentCount: 3,
  },
  {
    type: "Reference Links",
    count: 89,
    priority: "medium",
    description: "External reference validation",
    urgentCount: 15,
  },
];

function Home() {
  // Sample data for the charts
  const articleViewsData = generateTimeSeriesData(30, 500, 1000);
  const publicationsData = generateTimeSeriesData(30, 10, 50);

  // Sample individual article performance data
  const articlePerformanceData = getSampleArticleData();

  // TODO: Expect top 5 and bottom 5 performers to come from API call
  // instead of calculating from full dataset
  const { topPerformers, bottomPerformers } = getTopAndBottomPerformers(
    articlePerformanceData
  );

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-black mb-4 tracking-tighter">
        Home
      </h1>

      {/* Two LineGraphs side by side */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm">
            <LineGraph
              data={articleViewsData}
              title="Article Views"
              yAxisLabel="Views"
              lineColor="#3b82f6"
              height={300}
            />

            {/* Dividing line */}
            <div className="border-t border-gray-200 mx-4"></div>

            {/* Article Performance Section */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top 5 Performers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Top 5 Performers
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.map((article, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs"
                      >
                        <span
                          className="text-gray-600 truncate pr-2"
                          title={article.title}
                        >
                          {article.title}
                        </span>
                        <span className="font-medium text-green-600 whitespace-nowrap">
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom 5 Performers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Bottom 5 Performers
                  </h4>
                  <div className="space-y-2">
                    {bottomPerformers.map((article, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-xs"
                      >
                        <span
                          className="text-gray-600 truncate pr-2"
                          title={article.title}
                        >
                          {article.title}
                        </span>
                        <span className="font-medium text-red-600 whitespace-nowrap">
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <LineGraph
              data={publicationsData}
              title="Publications"
              yAxisLabel="Count"
              lineColor="#10b981"
              height={300}
            />
          </div>
        </div>
      </section>

      <div className="space-y-8 mt-10">
        <section>
          <h2 className="text-2xl font-inter font-medium text-gray-800 mb-4">
            Canonical Entities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getEntityQueueData().map((queue, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {queue.type}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      queue.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : queue.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {queue.priority}
                  </span>
                </div>

                <p className="text-gray-600 text-xs mb-4">
                  {queue.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Queue:</span>
                    <span className="font-semibold text-gray-900">
                      {queue.count}
                    </span>
                  </div>

                  {queue.urgentCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 text-sm">Urgent:</span>
                      <span className="font-semibold text-red-600">
                        {queue.urgentCount}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Review Queue →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Queue Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">
                  Total Entities Pending Review
                </h4>
                <p className="text-sm text-gray-600">Across all entity types</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {getEntityQueueData().reduce(
                    (sum, queue) => sum + queue.count,
                    0
                  )}
                </div>
                <div className="text-sm text-red-600">
                  {getEntityQueueData().reduce(
                    (sum, queue) => sum + queue.urgentCount,
                    0
                  )}{" "}
                  urgent
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-inter font-medium text-gray-800 mb-4">
            Drafts
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600">View and edit your draft articles.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-inter font-medium text-gray-800 mb-4">
            Published
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600">Browse your published articles.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
