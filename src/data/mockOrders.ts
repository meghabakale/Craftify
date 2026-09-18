import { CustomerOrder, OrderTrackingStage, OrderTrackingHistoryEvent, CustomerOrderItem, Product } from '../types';
import { OrderConfirmationData } from '../components/CheckoutPage';

export const ORDER_STAGES: OrderTrackingStage[] = [
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export const STAGE_DISPLAY_LABELS: Record<OrderTrackingStage, string> = {
  confirmed: 'Order Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const CANCELLATION_REASONS: string[] = [
  'Ordered by mistake',
  'Found another handcrafted item',
  'Delivery timeline is too long',
  'Need to modify delivery address / details',
  'Changed mind',
  'Other reason',
];

export interface OrderTrackingFaqItem {
  q: string;
  a: string;
}

export const ORDER_TRACKING_FAQS: OrderTrackingFaqItem[] = [
  {
    q: 'Where is my parcel right now?',
    a: 'Your parcel is handled by the assigned logistics carrier under your Tracking ID. You can expect delivery within the estimated delivery range displayed on this tracker.',
  },
  {
    q: 'What if the handcrafted item arrives damaged?',
    a: 'All items are 100% transit-insured. If your ceramic, brass, or textile item arrives damaged, report it within 7 days of delivery for a free immediate replacement or full escrow refund.',
  },
  {
    q: 'Can I change my delivery address?',
    a: 'Addresses can be updated as long as the status is "Order Confirmed" or "Packed". Once shipped, rerouting requires contacting the carrier with your Tracking ID.',
  },
  {
    q: 'How does Craftify artisan support work?',
    a: 'Your purchase directly backed the artisan guild who created this batch. Funds are released through milestone escrows as craftsmen finish production.',
  },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'CRF-2026-00542',
    orderDate: '13 Sept, 2026',
    estimatedDeliveryRange: 'Arriving between 19–23 Sept',
    status: 'confirmed',
    carrierName: 'Delhivery Surface',
    trackingNumber: 'IN0098412994',
    items: [
      {
        id: 'ord-item-03',
        productId: 'prd-01',
        title: 'Kuthu Vilakku Handcrafted Brass Temple Lamp',
        price: 2499,
        quantity: 1,
        imageUrl: '/images/products/kuthu-vilakku-brass-lamp.jpg',
        subtitle: 'SKU: CF-TNJ-01 • GI Swamimalai Bronze',
        isFundedOnCraftify: true,
        isFundedOnLaunchMart: true,
        artisanName: 'Thanjavur Brass Guild',
      },
    ],
    subtotal: 2499,
    shipping: 0,
    tax: 125,
    total: 2624,
    shippingAddress: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@indiamail.in',
      street: '42, 3rd Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'UPI (aarav@okhdfcbank)',
    history: [
      {
        stage: 'confirmed',
        label: 'Order Placed',
        timestamp: '13 Sept, 09:30 AM',
        location: 'Craftify Fulfillment Center',
        description: 'Payment authorized in patron escrow. Workshop queued for fulfillment.',
        completed: true,
      },
      {
        stage: 'packed',
        label: 'Packed',
        timestamp: 'Pending packaging',
        location: 'Thanjavur Brass Studio',
        description: 'Quality inspection and bubble packaging.',
        completed: false,
      },
      {
        stage: 'shipped',
        label: 'Shipped',
        timestamp: 'Pending dispatch',
        location: 'National Logistics Hub',
        description: 'Handoff to Delhivery Express.',
        completed: false,
      },
      {
        stage: 'out_for_delivery',
        label: 'Out for Delivery',
        timestamp: 'Pending delivery',
        location: 'Indiranagar Hub, Bengaluru',
        description: 'Courier partner doorstep run.',
        completed: false,
      },
      {
        stage: 'delivered',
        label: 'Delivered',
        timestamp: 'Expected 19–23 Sept',
        location: 'Doorstep Delivery',
        description: 'OTP signed delivery verification.',
        completed: false,
      },
    ],
  },
  {
    id: 'CRF-2026-00418',
    orderDate: '12 Sept, 2026',
    estimatedDeliveryRange: 'Arriving between 18–21 Sept',
    status: 'packed',
    carrierName: 'Blue Dart Express',
    trackingNumber: 'IN0098319521',
    items: [
      {
        id: 'ord-item-04',
        productId: 'prd-02',
        title: 'Hand-Block Printed Chanderi Silk Saree',
        price: 4200,
        quantity: 1,
        imageUrl: '/images/products/chanderi-silk-zari-saree.jpg',
        subtitle: 'SKU: CF-CHD-02 • Zari Border Edition',
        isFundedOnCraftify: true,
        isFundedOnLaunchMart: true,
        artisanName: 'Bunkar Sahakari Samiti',
      },
    ],
    subtotal: 4200,
    shipping: 0,
    tax: 210,
    total: 4410,
    shippingAddress: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@indiamail.in',
      street: '42, 3rd Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'RuPay Card (•••• 4242)',
    history: [
      {
        stage: 'confirmed',
        label: 'Order Placed',
        timestamp: '12 Sept, 11:20 AM',
        location: 'Craftify Fulfillment Center',
        description: 'Order confirmed and registered in patron escrow.',
        completed: true,
      },
      {
        stage: 'packed',
        label: 'Packed',
        timestamp: '12 Sept, 04:45 PM',
        location: 'Chanderi Artisan Hub, Madhya Pradesh',
        description: 'Weave inspection passed. Gift wrapped in handloom muslin sleeve.',
        completed: true,
      },
      {
        stage: 'shipped',
        label: 'Shipped',
        timestamp: 'Pending courier pickup',
        location: 'Bhopal Air Cargo Transit',
        description: 'Awaiting Blue Dart line-haul pickup.',
        completed: false,
      },
      {
        stage: 'out_for_delivery',
        label: 'Out for Delivery',
        timestamp: 'Pending arrival at city hub',
        location: 'Indiranagar Delivery Center, Bengaluru',
        description: 'Assigned to courier agent.',
        completed: false,
      },
      {
        stage: 'delivered',
        label: 'Delivered',
        timestamp: 'Expected 18–21 Sept',
        location: 'Doorstep Delivery',
        description: 'Final delivery completion.',
        completed: false,
      },
    ],
  },
  {
    id: 'CRF-2026-00123',
    orderDate: '11 Sept, 2026',
    estimatedDeliveryRange: 'Arriving between 18–22 Sept',
    status: 'shipped',
    carrierName: 'Blue Dart Express',
    trackingNumber: 'IN0098234561',
    items: [
      {
        id: 'ord-item-01',
        productId: 'prd-03',
        title: 'Handmade Terracotta Chai Cups & Water Matka Set',
        price: 549,
        quantity: 2,
        imageUrl: '/images/products/terracotta-chai-cups-matka.jpg',
        subtitle: 'SKU: CF-GKP-03 • Panchmura Terracotta Pottery',
        isFundedOnCraftify: true,
        isFundedOnLaunchMart: true,
        artisanName: 'Gopal Kumbhar',
      },
    ],
    subtotal: 1098,
    shipping: 0,
    tax: 55,
    total: 1153,
    shippingAddress: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@indiamail.in',
      street: '42, 3rd Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'UPI (aarav@okhdfcbank)',
    history: [
      {
        stage: 'confirmed',
        label: 'Order Placed',
        timestamp: '11 Sept, 10:15 AM',
        location: 'Bengaluru Fulfillment Desk',
        description: 'Payment verified and handcrafted batch assigned to artisan workshop.',
        completed: true,
      },
      {
        stage: 'packed',
        label: 'Packed',
        timestamp: '12 Sept, 03:40 PM',
        location: 'Bankura Artisan Cooperative, West Bengal',
        description: 'Item inspected for surface integrity and bubble-cushioned in biodegradable corrugated box.',
        completed: true,
      },
      {
        stage: 'shipped',
        label: 'Shipped',
        timestamp: '13 Sept, 09:20 AM',
        location: 'Kolkata Hub (In Transit via Blue Dart)',
        description: 'Dispatched via Express Line haul to Bengaluru Southern Hub.',
        completed: true,
      },
      {
        stage: 'out_for_delivery',
        label: 'Out for Delivery',
        timestamp: 'Pending dispatch from local Indiranagar hub',
        location: 'Indiranagar Delivery Center, Bengaluru',
        description: 'Assigned to courier agent for final-mile doorstep delivery.',
        completed: false,
      },
      {
        stage: 'delivered',
        label: 'Delivered',
        timestamp: 'Expected 18–22 Sept',
        location: 'Doorstep Delivery',
        description: 'Package handed over with OTP verification.',
        completed: false,
      },
    ],
  },
  {
    id: 'CRF-2026-00086',
    orderDate: '28 Aug, 2026',
    estimatedDeliveryRange: 'Delivered on 02 Sept',
    status: 'delivered',
    carrierName: 'Delhivery Surface',
    trackingNumber: 'DEL9921448102',
    items: [
      {
        id: 'ord-item-02',
        productId: 'prd-01',
        title: 'Solid Brass Hex Drafting Gauge & Pooja Diya',
        price: 1850,
        quantity: 1,
        imageUrl: '/images/products/kuthu-vilakku-brass-lamp.jpg',
        subtitle: 'SKU: CF-TNJ-01 • Thanjavur Virgin Brass',
        isFundedOnCraftify: false,
        isFundedOnLaunchMart: false,
        artisanName: 'Master Sthapathi',
      },
    ],
    subtotal: 1850,
    shipping: 0,
    tax: 92,
    total: 1942,
    shippingAddress: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@indiamail.in',
      street: '42, 3rd Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
      phone: '+91 98765 43210',
    },
    paymentMethod: 'RuPay Card (•••• 4242)',
    history: [
      {
        stage: 'confirmed',
        label: 'Order Confirmed',
        timestamp: '28 Aug, 02:10 PM',
        location: 'Craftify Central',
        description: 'Order placed and logged into patron escrow.',
        completed: true,
      },
      {
        stage: 'packed',
        label: 'Packed',
        timestamp: '29 Aug, 11:30 AM',
        location: 'Thanjavur Brass Studio',
        description: 'Quality tested and packed in velvet box.',
        completed: true,
      },
      {
        stage: 'shipped',
        label: 'Shipped',
        timestamp: '30 Aug, 04:15 PM',
        location: 'Chennai Air Cargo Hub',
        description: 'In transit to destination city.',
        completed: true,
      },
      {
        stage: 'out_for_delivery',
        label: 'Out for Delivery',
        timestamp: '02 Sept, 08:30 AM',
        location: 'Bengaluru Hub',
        description: 'Delivery associate out on route.',
        completed: true,
      },
      {
        stage: 'delivered',
        label: 'Delivered',
        timestamp: '02 Sept, 02:45 PM',
        location: 'Indiranagar, Bengaluru',
        description: 'Delivered to resident and signed.',
        completed: true,
      },
    ],
  },
];

export function buildDefaultHistory(
  status: OrderTrackingStage,
  orderDateFormatted: string
): OrderTrackingHistoryEvent[] {
  const stageIndex = ORDER_STAGES.indexOf(status);

  return [
    {
      stage: 'confirmed',
      label: 'Order Confirmed',
      timestamp: `${orderDateFormatted}, 10:30 AM`,
      location: 'Craftify Fulfillment Center',
      description: 'Your order was verified and sent directly to the artisan workshop.',
      completed: stageIndex >= 0,
    },
    {
      stage: 'packed',
      label: 'Packed',
      timestamp: stageIndex >= 1 ? `${orderDateFormatted}, 04:15 PM` : 'Pending packaging',
      location: 'Artisan Workshop Hub',
      description: 'Craftsperson completed inspection and secured package.',
      completed: stageIndex >= 1,
    },
    {
      stage: 'shipped',
      label: 'Shipped',
      timestamp: stageIndex >= 2 ? 'In Transit — Blue Dart Express' : 'Pending dispatch',
      location: 'National Logistics Hub',
      description: 'Handed over to carrier for insured transport.',
      completed: stageIndex >= 2,
    },
    {
      stage: 'out_for_delivery',
      label: 'Out for Delivery',
      timestamp: stageIndex >= 3 ? 'Today, 09:00 AM' : 'Expected soon',
      location: 'Local Delivery Facility',
      description: 'Courier agent has left the distribution center.',
      completed: stageIndex >= 3,
    },
    {
      stage: 'delivered',
      label: 'Delivered',
      timestamp: stageIndex >= 4 ? 'Today, 02:15 PM' : 'Expected delivery',
      location: 'Delivery Address',
      description: 'Package delivered to recipient.',
      completed: stageIndex >= 4,
    },
  ];
}

export function createOrderFromConfirmation(
  conf: OrderConfirmationData,
  productsCatalog?: Product[]
): CustomerOrder {
  // Generate random 5-digit order id matching CRF-2026-00123 format
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `CRF-2026-${randomNum}`;

  // Estimate delivery range: today + 6 to + 10 days
  const now = new Date();
  const startEst = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const endEst = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  const startDay = startEst.getDate();
  const endDay = endEst.getDate();
  const endMonth = endEst.toLocaleDateString('en-IN', { month: 'short' });
  const deliveryRange = `Arriving between ${startDay}–${endDay} ${endMonth}`;

  // Random tracking number
  const trackingNumber = `IN${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  // Convert CartItems to CustomerOrderItems
  const orderItems: CustomerOrderItem[] = conf.items.map((item) => {
    // Check if item corresponds to a product in catalog
    const matchedProduct = productsCatalog?.find(
      (p) => p.id === item.id || p.title.toLowerCase() === item.title.toLowerCase()
    );

    const isFundedOnCraftify =
      (matchedProduct?.isFundedOnCraftify ?? matchedProduct?.isFundedOnLaunchMart) ??
      (item.title.toLowerCase().includes('terracotta') || item.type === 'pledge');

    const artisanName = matchedProduct?.creator?.split(',')[0] || 'Artisan Guild';

    return {
      id: item.id,
      productId: matchedProduct?.id || item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      subtitle: item.subtitle,
      isFundedOnCraftify,
      isFundedOnLaunchMart: isFundedOnCraftify,
      artisanName,
    };
  });

  const orderDateFormatted = conf.orderDate || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    id: orderId,
    orderDate: orderDateFormatted,
    estimatedDeliveryRange: deliveryRange,
    status: 'confirmed',
    carrierName: 'Blue Dart Express',
    trackingNumber,
    items: orderItems,
    subtotal: conf.subtotal,
    shipping: conf.shipping,
    tax: conf.tax,
    total: conf.total,
    shippingAddress: { ...conf.shippingAddress },
    paymentMethod: conf.paymentMethod,
    history: buildDefaultHistory('confirmed', orderDateFormatted),
  };
}

export function advanceOrderStatus(order: CustomerOrder): CustomerOrder {
  if (order.status === 'cancelled') {
    return order;
  }
  const currentIndex = ORDER_STAGES.indexOf(order.status);
  if (currentIndex >= ORDER_STAGES.length - 1) {
    // If already delivered, cycle back to confirmed for continuous demo testing
    return {
      ...order,
      status: 'confirmed',
      history: buildDefaultHistory('confirmed', order.orderDate),
    };
  }

  const nextStage = ORDER_STAGES[currentIndex + 1];
  const updatedHistory = buildDefaultHistory(nextStage, order.orderDate);

  return {
    ...order,
    status: nextStage,
    history: updatedHistory,
  };
}
