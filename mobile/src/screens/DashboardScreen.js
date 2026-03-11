import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todaySales: 2450.00,
    totalOrders: 87,
    profitMargin: 45.2,
    lowStockItems: 12,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const StatCard = ({ title, value, subtitle, iconName, color }) => (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={styles.statHeader}>
          <Icon name={iconName} size={32} color={color} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Title style={styles.statTitle}>{title}</Title>
        <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Back! 🍺</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Today's Sales"
          value={`$${stats.todaySales.toFixed(2)}`}
          subtitle="↗ +12.5% from yesterday"
          iconName="cash-multiple"
          color="#10b981"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="↗ +8 orders"
          iconName="receipt"
          color="#6366f1"
        />
        <StatCard
          title="Profit Margin"
          value={`${stats.profitMargin}%`}
          subtitle="↗ +2.3%"
          iconName="chart-line"
          color="#f59e0b"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems}
          subtitle="⚠ Needs attention"
          iconName="alert-circle"
          color="#ef4444"
        />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
          onPress={() => navigation.navigate('Sales')}
        >
          <Icon name="cash-register" size={32} color="#fff" />
          <Text style={styles.actionText}>New Sale</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Icon name="food" size={32} color="#fff" />
          <Text style={styles.actionText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
          onPress={() => navigation.navigate('Stock')}
        >
          <Icon name="package-variant" size={32} color="#fff" />
          <Text style={styles.actionText}>Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Icon name="chart-bar" size={32} color="#fff" />
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.recentSalesCard}>
        <Card.Content>
          <Title>Recent Sales</Title>
          <View style={styles.saleItem}>
            <View>
              <Text style={styles.saleInvoice}>INV-202603-00087</Text>
              <Text style={styles.saleTime}>10:30 AM</Text>
            </View>
            <Text style={styles.saleAmount}>$45.00</Text>
          </View>
          <View style={styles.saleItem}>
            <View>
              <Text style={styles.saleInvoice}>INV-202603-00086</Text>
              <Text style={styles.saleTime}>10:15 AM</Text>
            </View>
            <Text style={styles.saleAmount}>$78.50</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  date: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#1e293b',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  statTitle: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#10b981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    padding: 20,
    paddingBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  recentSalesCard: {
    margin: 15,
    backgroundColor: '#1e293b',
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  saleInvoice: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  saleTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

export default DashboardScreen;
