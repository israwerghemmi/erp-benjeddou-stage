import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="erp-app">
      <Sidebar />
      <main className="erp-main">
        {children}
      </main>
    </div>
  );
}
