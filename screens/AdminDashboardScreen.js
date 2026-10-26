import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
  Modal,
  TextInput,
  Animated,
  Easing,
  useWindowDimensions,
  KeyboardAvoidingView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  HeroGradientCard,
  StatCard,
  ActionRowCard,
  StatusTag,
  ScreenHeader,
} from '../src/components';
import {
  getAdminDashboard,
  getPendingCashRequests,
  verifyCashRequest,
  rejectCashRequest,
  getPendingOnlinePayments,
  verifyOnlinePayment,
  rejectOnlinePayment,
  createPaymentAllocation,
  getMaintenanceByRoom,
  getAllRooms,
  createRoom,
  updateRoomExemption,
  getAllResidents,
  resetResidentPassword,
} from '../src/services/adminService';

const TAB_ORDER = ['dashboard', 'payments', 'rooms', 'profile'];

export default function AdminDashboardScreen({
  navigation,
  user,
  onLogout,
  onChangePassword,
  onNavigateResident,
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Horizontal pager animation for smooth, 100% flicker-free sliding between tabs
  const pagerAnim = useRef(new Animated.Value(0)).current;

  // Separate scroll view refs for each tab
  const dashboardScrollRef = useRef(null);
  const paymentsScrollRef = useRef(null);
  const roomsScrollRef = useRef(null);
  const profileScrollRef = useRef(null);

  // Scale animations for individual bottom tab buttons
  const tabScaleAnims = useRef({
    dashboard: new Animated.Value(1),
    payments: new Animated.Value(1),
    rooms: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  // Live admin dashboard API state
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Live pending payments state
  const [pendingPayments, setPendingPayments] = useState([]);
  const [verifiedHistory, setVerifiedHistory] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isRefreshingPayments, setIsRefreshingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

  // Async action state for double submission prevention
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Proof viewer modal state
  const [viewingProof, setViewingProof] = useState(null);

  // Allocation & verification modal state
  const [verifyModalItem, setVerifyModalItem] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [roomMaintenanceRecords, setRoomMaintenanceRecords] = useState([]);
  const [isLoadingRoomMaintenance, setIsLoadingRoomMaintenance] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

  // Live rooms and residents administration state (Phase 7)
  const [liveRooms, setLiveRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isRefreshingRooms, setIsRefreshingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [roomFilter, setRoomFilter] = useState('all');

  // Room details modal state
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [isTogglingExemption, setIsTogglingExemption] = useState(false);

  // Password reset modal state
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  // Add room modal state
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomIsExempt, setNewRoomIsExempt] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recent';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today, ${timeStr}`;
      return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${timeStr}`;
    } catch {
      return 'Recent';
    }
  };

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingDashboard(true);
    }
    setDashboardError(null);
    try {
      const data = await getAdminDashboard();
      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.warn('Failed to load admin dashboard:', err?.message || err);
      if (err?.response?.status === 403) {
        setDashboardError('Access denied: Administrator permissions required.');
      } else {
        setDashboardError(
          err?.response?.data?.message || err?.message || 'Unable to connect to admin dashboard server'
        );
      }
    } finally {
      setIsLoadingDashboard(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchPaymentsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingPayments(true);
    } else {
      setIsLoadingPayments(true);
    }
    setPaymentsError(null);
    try {
      const [cashRes, onlineRes] = await Promise.allSettled([
        getPendingCashRequests(),
        getPendingOnlinePayments(),
      ]);

      const cashItems =
        cashRes.status === 'fulfilled' && Array.isArray(cashRes.value)
          ? cashRes.value.map((c) => ({
              id: `cash_${c.id}`,
              backendId: c.id,
              roomId: c.roomId,
              room: c.roomNumber || (c.roomId ? String(c.roomId) : 'Unknown'),
              resident: c.residentName || `Room ${c.roomNumber || ''} Resident`,
              amount: `₹${Number(c.amount || 0).toLocaleString('en-IN')}`,
              rawAmount: Number(c.amount || 0),
              type: 'cash',
              method: 'Cash Payment',
              refId: c.residentNote || 'Cash handover at desk',
              date: formatDateTime(c.createdAt),
              status: 'pending',
              screenshotUrl: null,
              originalData: c,
            }))
          : [];

      const onlineItems =
        onlineRes.status === 'fulfilled' && Array.isArray(onlineRes.value)
          ? onlineRes.value.map((p) => ({
              id: `online_${p.id}`,
              backendId: p.id,
              roomId: p.roomId,
              room: p.roomNumber || (p.roomId ? String(p.roomId) : 'Unknown'),
              resident: `Room ${p.roomNumber || ''} Resident`,
              amount: `₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
              rawAmount: Number(p.amount || 0),
              type: 'online',
              method: p.paymentMode === 'ONLINE' ? 'UPI / Online' : (p.paymentMode || 'Online Payment'),
              refId: p.transactionReference || 'UTR-PENDING',
              date: formatDateTime(p.createdAt),
              status: 'pending',
              screenshotUrl: p.screenshotUrl || null,
              originalData: p,
            }))
          : [];

      if (cashRes.status === 'rejected' && onlineRes.status === 'rejected') {
        const err = cashRes.reason || onlineRes.reason;
        throw err;
      }

      setPendingPayments([...cashItems, ...onlineItems]);
    } catch (err) {
      console.warn('Failed to load pending payments:', err?.message || err);
      if (err?.response?.status === 403) {
        setPaymentsError('Admin permissions required to view pending payments.');
      } else {
        setPaymentsError(
          err?.response?.data?.message || err?.message || 'Unable to connect to payments server'
        );
      }
    } finally {
      setIsLoadingPayments(false);
      setIsRefreshingPayments(false);
    }
  }, []);

  const fetchRoomsAndResidentsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingRooms(true);
    } else {
      setIsLoadingRooms(true);
    }
    setRoomsError(null);

    try {
      const [roomsRes, residentsRes] = await Promise.all([
        getAllRooms(),
        getAllResidents(),
      ]);

      setLiveRooms(Array.isArray(roomsRes) ? roomsRes : []);
      setResidents(Array.isArray(residentsRes) ? residentsRes : []);
    } catch (err) {
      console.warn('Failed to load rooms/residents:', err?.message || err);
      if (err?.response?.status === 403) {
        setRoomsError('Admin permissions required to manage rooms and residents.');
      } else {
        setRoomsError(
          err?.response?.data?.message || err?.message || 'Unable to connect to rooms server.'
        );
      }
    } finally {
      setIsLoadingRooms(false);
      setIsRefreshingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData(false);
      fetchPaymentsData(false);
      fetchRoomsAndResidentsData(false);
    }
  }, [user, fetchDashboardData, fetchPaymentsData, fetchRoomsAndResidentsData]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigation?.reset?.({
        index: 0,
        routes: [{ name: user ? 'Dashboard' : 'Welcome' }],
      });
    }
  }, [user, navigation]);

  // Keep pager aligned if screen orientation or dimensions change
  useEffect(() => {
    const idx = TAB_ORDER.indexOf(activeTab);
    pagerAnim.setValue(-idx * screenWidth);
  }, [screenWidth, activeTab, pagerAnim]);

  const handleTabPress = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) {
        if (nextTab === 'dashboard') dashboardScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'payments') paymentsScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'rooms') {
          roomsScrollRef.current?.scrollTo({ y: 0, animated: true });
          fetchRoomsAndResidentsData(true);
        }
        else if (nextTab === 'profile') profileScrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      if (nextTab === 'rooms' && liveRooms.length === 0) {
        fetchRoomsAndResidentsData(false);
      }

      const nextIndex = TAB_ORDER.indexOf(nextTab);

      if (tabScaleAnims[nextTab]) {
        tabScaleAnims[nextTab].setValue(0.85);
        Animated.spring(tabScaleAnims[nextTab], {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }).start();
      }

      setActiveTab(nextTab);

      Animated.timing(pagerAnim, {
        toValue: -nextIndex * screenWidth,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    },
    [activeTab, screenWidth, pagerAnim, tabScaleAnims]
  );

  if (user?.role !== 'ADMIN') {
    return null;
  }

  // Combined live payments state
  const payments = [...pendingPayments, ...verifiedHistory];

  // Mock rooms as dynamic state
  const [rooms, setRooms] = useState([
    { room: '101', resident: 'Aarav Gupta', phone: '+91 98765 43210', status: 'paid', dues: '₹0' },
    { room: '102', resident: 'Ananya Sharma', phone: '+91 98234 56789', status: 'pending', dues: '₹1,500' },
    { room: '103', resident: 'Rohit Kulkarni', phone: '+91 97123 45678', status: 'paid', dues: '₹0' },
    { room: '104', resident: 'Pravin Kumar', phone: '+91 96543 21098', status: 'paid', dues: '₹0' },
    { room: '105', resident: 'Amit Verma', phone: '+91 95432 10987', status: 'overdue', dues: '₹3,000' },
    { room: '201', resident: 'Suresh Menon', phone: '+91 94321 09876', status: 'paid', dues: '₹0' },
    { room: '202', resident: 'Neha Chawla', phone: '+91 93210 98765', status: 'paid', dues: '₹0' },
    { room: '203', resident: 'Pooja Hegde', phone: '+91 92109 87654', status: 'pending', dues: '₹1,500' },
    { room: '204', resident: 'Rajesh Patel', phone: '+91 91098 76543', status: 'pending', dues: '₹1,500' },
    { room: '301', resident: 'Sunita Rao', phone: '+91 90987 65432', status: 'overdue', dues: '₹3,000' },
  ]);

  const formatCurrency = (val) => {
    if (val == null || isNaN(val)) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'long' });
  const heroTitle = `${currentMonthName} Collection`;

  const backendCollectedNum = dashboardData?.totalMaintenanceCollected != null
    ? Number(dashboardData.totalMaintenanceCollected)
    : 0;
  const backendOutstandingNum = dashboardData?.totalOutstandingBalance != null
    ? Number(dashboardData.totalOutstandingBalance)
    : 0;
  const totalExpectedNum = backendCollectedNum + backendOutstandingNum;
  const collectionProgress = totalExpectedNum > 0
    ? Math.min(100, Math.round((backendCollectedNum / totalExpectedNum) * 100))
    : (backendCollectedNum > 0 ? 100 : 0);

  const heroCollectedStr = formatCurrency(backendCollectedNum);
  const heroRemainingStr = formatCurrency(backendOutstandingNum);
  const totalPendingDuesStr = formatCurrency(backendOutstandingNum);

  const onlinePendingCount = dashboardData?.pendingOnlinePayments != null
    ? Number(dashboardData.pendingOnlinePayments)
    : payments.filter((p) => p.type === 'online' && p.status === 'pending').length;

  const cashPendingCount = dashboardData?.pendingCashRequests != null
    ? Number(dashboardData.pendingCashRequests)
    : payments.filter((p) => p.type === 'cash' && p.status === 'pending').length;

  const verifiedCount = dashboardData?.verifiedCashPayments != null
    ? Number(dashboardData.verifiedCashPayments)
    : payments.filter((p) => p.status === 'verified').length;

  const handleLogoutConfirm = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Admin Dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  const handleCopyRef = (refId) => {
    Alert.alert('Copied', `Reference ID "${refId}" copied.`);
  };

  const handleOpenVerifyModal = async (paymentId) => {
    const item = payments.find((p) => p.id === paymentId);
    if (!item) return;

    const numericStr = String(item.rawAmount || item.amount.replace(/[^0-9]/g, ''));
    setVerifyModalItem(item);
    setCustomAmount(numericStr);
    setAdminRemarks(item.type === 'cash' ? 'Cash verified and received' : 'UPI transaction verified');
    setSelectedMaintenanceId(null);
    setRoomMaintenanceRecords([]);

    if (item.roomId) {
      setIsLoadingRoomMaintenance(true);
      try {
        const records = await getMaintenanceByRoom(item.roomId);
        if (Array.isArray(records)) {
          setRoomMaintenanceRecords(records);
          const pendingRecord = records.find((r) => Number(r.remainingBalance) > 0);
          if (pendingRecord) {
            setSelectedMaintenanceId(pendingRecord.id);
          } else if (records.length > 0) {
            setSelectedMaintenanceId(records[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not load maintenance records for room:', err?.message || err);
      } finally {
        setIsLoadingRoomMaintenance(false);
      }
    }
  };

  const handleConfirmVerification = async () => {
    if (!verifyModalItem || isSubmittingAction) return;
    const cleanNum = customAmount.replace(/[^0-9]/g, '');
    const approvedNum = parseInt(cleanNum, 10);
    if (!cleanNum || isNaN(approvedNum) || approvedNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than ₹0.');
      return;
    }

    const isCash = verifyModalItem.type === 'cash';

    if (isCash) {
      if (!selectedMaintenanceId) {
        Alert.alert(
          'Maintenance Record Required',
          'Cash verification requires allocating the payment to an active maintenance record for this room. Please select a maintenance record below.'
        );
        return;
      }
      if (approvedNum !== verifyModalItem.rawAmount) {
        Alert.alert(
          'Allocation Amount Rule',
          `Under society rules, the verified cash allocation must match the declared request amount (₹${verifyModalItem.rawAmount.toLocaleString('en-IN')}).`
        );
        return;
      }
    }

    setIsSubmittingAction(true);
    setActionLoadingId(verifyModalItem.id);
    setActionType('verify');

    try {
      if (isCash) {
        await verifyCashRequest(verifyModalItem.backendId, {
          adminNote: adminRemarks.trim() || 'Cash payment verified by Admin',
          allocations: [
            {
              maintenanceId: selectedMaintenanceId,
              amount: approvedNum,
            },
          ],
        });
      } else {
        await verifyOnlinePayment(verifyModalItem.backendId);

        if (selectedMaintenanceId) {
          try {
            await createPaymentAllocation({
              paymentId: verifyModalItem.backendId,
              maintenanceId: selectedMaintenanceId,
              amount: approvedNum,
            });
          } catch (allocErr) {
            console.warn('Payment verified but allocation failed:', allocErr?.message || allocErr);
            Alert.alert(
              'Payment Verified (Allocation Notice)',
              `The payment was verified successfully, but maintenance allocation returned: ${
                allocErr?.response?.data?.message || allocErr?.message || 'Check room dues'
              }`
            );
          }
        }
      }

      const formattedAmount = `₹${approvedNum.toLocaleString('en-IN')}`;
      const origAmount = verifyModalItem.amount;
      const targetRoom = verifyModalItem.room;
      const isCustom = formattedAmount !== origAmount;

      const verifiedItem = {
        ...verifyModalItem,
        status: 'verified',
        verifiedAmount: formattedAmount,
        originalAmount: origAmount,
        adminRemark:
          adminRemarks.trim() ||
          (isCustom
            ? `Approved custom amount of ${formattedAmount}`
            : 'Payment verified by Admin'),
        verifiedDate: 'Today, Just now',
      };

      setVerifiedHistory((prev) => [verifiedItem, ...prev]);
      setPendingPayments((prev) => prev.filter((p) => p.id !== verifyModalItem.id));

      setVerifyModalItem(null);
      setCustomAmount('');
      setAdminRemarks('');
      setSelectedMaintenanceId(null);

      fetchDashboardData(true);
      fetchPaymentsData(true);

      Alert.alert(
        'Payment Verified & Approved',
        `Successfully approved ${formattedAmount} for Room ${targetRoom}.${
          isCustom ? ` (Original declared: ${origAmount})` : ''
        }`
      );
    } catch (err) {
      console.warn('Verification failed:', err);
      Alert.alert(
        'Verification Failed',
        err?.response?.data?.message || err?.message || 'Unable to complete verification request.'
      );
    } finally {
      setIsSubmittingAction(false);
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleRejectPayment = (paymentId) => {
    const item = payments.find((p) => p.id === paymentId);
    if (!item || isSubmittingAction) return;

    Alert.alert(
      'Reject Request',
      `Reject payment request of ${item.amount} from Room ${item?.room}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsSubmittingAction(true);
            setActionLoadingId(item.id);
            setActionType('reject');

            try {
              if (item.type === 'cash') {
                await rejectCashRequest(item.backendId, 'Rejected by Administrator');
              } else {
                await rejectOnlinePayment(item.backendId);
              }

              setPendingPayments((prev) => prev.filter((p) => p.id !== item.id));

              fetchDashboardData(true);
              fetchPaymentsData(true);

              Alert.alert('Declined', `Payment request from Room ${item?.room} was rejected.`);
            } catch (err) {
              console.warn('Rejection failed:', err);
              Alert.alert(
                'Rejection Failed',
                err?.response?.data?.message || err?.message || 'Unable to reject payment request.'
              );
            } finally {
              setIsSubmittingAction(false);
              setActionLoadingId(null);
              setActionType(null);
            }
          },
        },
      ]
    );
  };

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'online') return p.type === 'online' && p.status === 'pending';
    if (paymentFilter === 'cash') return p.type === 'cash' && p.status === 'pending';
    if (paymentFilter === 'verified') return p.status === 'verified';
    return p.status === 'pending';
  });

  const handleResetPassword = (resident) => {
    if (!resident || !resident.id) {
      Alert.alert('Error', 'Resident account information not available.');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Are you sure you want to reset the password for ${resident.name} (Room ${resident.roomNumber})?\n\nA secure temporary password will be generated, and the resident must set a new password upon their next login.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Password',
          style: 'destructive',
          onPress: async () => {
            setIsResettingPassword(true);
            try {
              const res = await resetResidentPassword(resident.id);
              setSelectedRoomDetail(null);
              setResetResult({
                roomNumber: res.roomNumber || resident.roomNumber,
                userName: resident.name,
                temporaryPassword: res.temporaryPassword,
              });
            } catch (err) {
              console.warn('Password reset failed:', err?.message || err);
              Alert.alert(
                'Reset Failed',
                err?.response?.data?.message || err?.message || 'Unable to reset password.'
              );
            } finally {
              setIsResettingPassword(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleExemption = (room) => {
    if (!room || !room.id) {
      Alert.alert('Unavailable', 'Room ID not found in database records.');
      return;
    }

    const nextState = !room.isExempt;
    const actionLabel = nextState ? 'Mark Maintenance Exempt' : 'Remove Maintenance Exemption';

    Alert.alert(
      actionLabel,
      `Are you sure you want to ${nextState ? 'exempt Room ' + room.roomNumber + ' from monthly maintenance fees' : 'restore standard monthly maintenance fees for Room ' + room.roomNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsTogglingExemption(true);
            try {
              const updated = await updateRoomExemption(room.id, nextState);
              setLiveRooms((prev) =>
                prev.map((r) => (r.id === room.id ? { ...r, maintenanceExempt: updated.maintenanceExempt } : r))
              );
              setSelectedRoomDetail((prev) =>
                prev && prev.id === room.id ? { ...prev, isExempt: updated.maintenanceExempt } : prev
              );
              Alert.alert('Success', `Room ${room.roomNumber} exemption status updated.`);
            } catch (err) {
              console.warn('Exemption update failed:', err?.message || err);
              Alert.alert(
                'Update Failed',
                err?.response?.data?.message || err?.message || 'Unable to update exemption.'
              );
            } finally {
              setIsTogglingExemption(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateRoom = async () => {
    const trimmed = newRoomNumber.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Please enter a valid room number.');
      return;
    }

    setIsCreatingRoom(true);
    try {
      await createRoom({
        roomNumber: trimmed,
        maintenanceExempt: newRoomIsExempt,
      });

      setCreateRoomModalVisible(false);
      setNewRoomNumber('');
      setNewRoomIsExempt(false);
      await fetchRoomsAndResidentsData(true);
      Alert.alert('Success', `Room ${trimmed} created successfully.`);
    } catch (err) {
      console.warn('Room creation failed:', err?.message || err);
      Alert.alert(
        'Creation Failed',
        err?.response?.data?.message || err?.message || 'Unable to create room.'
      );
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const allRoomsSource = liveRooms.length > 0 ? liveRooms : rooms;

  const combinedRooms = allRoomsSource.map((r) => {
    const roomNumberStr = String(r.roomNumber || r.room || '');
    const resident = residents.find(
      (u) =>
        (r.id != null && u.roomId != null && String(u.roomId) === String(r.id)) ||
        String(u.roomNumber) === roomNumberStr
    );

    return {
      id: r.id,
      roomNumber: roomNumberStr,
      room: roomNumberStr,
      isExempt: !!r.maintenanceExempt,
      status: r.status,
      resident: resident ? resident.name : (liveRooms.length === 0 ? r.resident : null),
      phone: resident ? resident.mobileNumber : (liveRooms.length === 0 ? r.phone : null),
      residentData: resident || null,
      isOccupied: !!resident || (liveRooms.length === 0 && !!r.resident),
      dues: r.dues || (r.maintenanceExempt ? 'Exempt' : '₹0'),
    };
  });

  const filteredRooms = combinedRooms.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      r.roomNumber.toLowerCase().includes(query) ||
      (r.resident && r.resident.toLowerCase().includes(query)) ||
      (r.phone && r.phone.includes(query));

    if (!matchesSearch) return false;

    if (roomFilter === 'occupied') return r.isOccupied;
    if (roomFilter === 'vacant') return !r.isOccupied;
    if (roomFilter === 'exempt') return r.isExempt;
    return true;
  });

  const totalRoomsCount = combinedRooms.length;
  const occupiedRoomsCount = combinedRooms.filter((r) => r.isOccupied).length;
  const vacantRoomsCount = combinedRooms.filter((r) => !r.isOccupied).length;
  const exemptRoomsCount = combinedRooms.filter((r) => r.isExempt).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="dark" />

      {/* Persistent Reusable Screen Header: stays mounted, smoothly updates text/data */}
      <ScreenHeader
        user={user}
        activeTab={activeTab}
        brandTitle="Residency Admin"
        unreadCount={onlinePendingCount + cashPendingCount}
        onPressNotifications={() => setNotificationsVisible(true)}
        onPressAvatar={() => handleTabPress('profile')}
        onPressLogo={() => handleTabPress('dashboard')}
      />

      {/* Horizontal Sliding Pager Container (zero-flicker native translation) */}
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View
          style={{
            flex: 1,
            flexDirection: 'row',
            width: screenWidth * 4,
            transform: [{ translateX: pagerAnim }],
          }}
        >
          {/* TAB 0: DASHBOARD */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={dashboardScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchDashboardData(true)}
                  tintColor="#F57C00"
                  colors={['#F57C00']}
                />
              }
            >
              {/* Optional Error / Retry Notice Banner if request failed */}
              {dashboardError && !dashboardData && (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                  }}
                >
                  <Ionicons name="alert-circle" size={22} color="#DC2626" style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#991B1B' }}>
                    {dashboardError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchDashboardData(false)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: '#DC2626',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Initial Loading Indicator */}
              {isLoadingDashboard && !dashboardData && !dashboardError && (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#F57C00" />
                </View>
              )}

              {/* Empty Data notice if society has no records */}
              {dashboardData && Number(dashboardData.totalRooms || 0) === 0 && (
                <View
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#DBEAFE',
                  }}
                >
                  <Ionicons name="information-circle" size={22} color="#2563EB" style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#1E40AF' }}>
                    No rooms or maintenance records registered yet. New records created by admin will appear here.
                  </Text>
                </View>
              )}

              {/* Reusable Hero Monthly Collection Card */}
              <HeroGradientCard
                variant="collection"
                title={heroTitle}
                collected={heroCollectedStr}
                remaining={heroRemainingStr}
                progress={collectionProgress}
                progressLabel={`${collectionProgress}% collected`}
                onPress={() => {
                  handleTabPress('payments');
                  setPaymentFilter('all');
                }}
                onPressChevron={() => {
                  handleTabPress('payments');
                  setPaymentFilter('all');
                }}
              />

              {/* 3 Metric / Stat Cards Row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {/* Card 1: Total Pending Dues */}
                <StatCard
                  renderIcon={() => (
                    <MaterialCommunityIcons name="database-outline" size={20} color="#EA580C" />
                  )}
                  iconBgColor="#FFEDD5"
                  title="Total Pending Dues"
                  value={totalPendingDuesStr}
                  subtitle={
                    dashboardData?.totalRooms != null
                      ? `Across ${dashboardData.totalRooms} rooms`
                      : 'Total unpaid amount across residents'
                  }
                  onPress={() => {
                    handleTabPress('rooms');
                  }}
                />

                {/* Card 2: Online Reviews */}
                <StatCard
                  iconName="card"
                  iconFamily="Ionicons"
                  iconColor="#D97706"
                  iconBgColor="#FEF3C7"
                  title="Online Reviews"
                  value={onlinePendingCount.toString()}
                  subtitle="Payments awaiting verification"
                  onPress={() => {
                    handleTabPress('payments');
                    setPaymentFilter('online');
                  }}
                />

                {/* Card 3: Cash Reviews */}
                <StatCard
                  iconName="cash"
                  iconFamily="Ionicons"
                  iconColor="#EA580C"
                  iconBgColor="#FFEDD5"
                  title="Cash Reviews"
                  value={cashPendingCount.toString()}
                  subtitle="Cash requests awaiting verification"
                  onPress={() => {
                    handleTabPress('payments');
                    setPaymentFilter('cash');
                  }}
                />
              </View>

              {/* Pending Verification Section */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: -0.3,
                    marginBottom: 12,
                  }}
                >
                  Pending Verification
                </Text>

                {/* Unified White Card Container with 2 Action Rows */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1.5,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  {/* Row 1: Online Payments */}
                  <ActionRowCard
                    iconName="card"
                    iconFamily="Ionicons"
                    iconColor="#EA580C"
                    iconBgColor="#FFEDD5"
                    title="Online Payments"
                    subtitle="Submitted by residents"
                    tagLabel={`${onlinePendingCount} pending`}
                    tagVariant="orange"
                    showAction={true}
                    actionText="Review"
                    showDivider={true}
                    onPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('online');
                    }}
                    onActionPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('online');
                    }}
                  />

                  {/* Row 2: Cash Requests */}
                  <ActionRowCard
                    iconName="cash"
                    iconFamily="Ionicons"
                    iconColor="#D97706"
                    iconBgColor="#FEF3C7"
                    title="Cash Requests"
                    subtitle="Declared by residents"
                    tagLabel={`${cashPendingCount} pending`}
                    tagVariant="amber"
                    showAction={true}
                    actionText="Review"
                    showDivider={false}
                    onPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('cash');
                    }}
                    onActionPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('cash');
                    }}
                  />
                </View>
              </View>

              {/* Recent Activity Section */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: -0.3,
                    marginBottom: 12,
                  }}
                >
                  Recent Activity
                </Text>

                {/* Verified Activity Card */}
                <ActionRowCard
                  asCard={true}
                  iconName="checkmark-circle"
                  iconFamily="Ionicons"
                  iconColor="#16A34A"
                  iconBgColor="#DCFCE7"
                  title="Room 104 • Payment verified"
                  subtitle="₹1,500"
                  showChevron={true}
                  chevronColor="#94A3B8"
                  onPress={() => {
                    setSelectedActivity({
                      room: '104',
                      resident: 'Pravin Kumar',
                      amount: '₹1,500',
                      date: 'Today, 08:15 AM',
                      status: 'Verified by Admin',
                      mode: 'UPI (GPay)',
                    });
                  }}
                />
              </View>
            </ScrollView>
          </View>

          {/* TAB 1: PAYMENTS */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={paymentsScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshingPayments}
                  onRefresh={() => {
                    fetchDashboardData(true);
                    fetchPaymentsData(true);
                  }}
                  tintColor="#F57C00"
                  colors={['#F57C00']}
                />
              }
            >
              {/* Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 18 }}
              >
                {[
                  { key: 'all', label: `Pending (${payments.filter((p) => p.status === 'pending').length})` },
                  { key: 'online', label: `Online (${onlinePendingCount})` },
                  { key: 'cash', label: `Cash (${cashPendingCount})` },
                  { key: 'verified', label: `Verified (${verifiedCount})` },
                ].map((filter) => {
                  const isActive = paymentFilter === filter.key;
                  return (
                    <TouchableOpacity
                      key={filter.key}
                      onPress={() => setPaymentFilter(filter.key)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 9,
                        borderRadius: 20,
                        backgroundColor: isActive ? '#F57C00' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isActive ? '#F57C00' : '#E2E8F0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: isActive ? '#FFFFFF' : '#475569',
                        }}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Payments Tab Error Banner */}
              {paymentsError && pendingPayments.length === 0 && (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                  }}
                >
                  <Ionicons name="alert-circle" size={22} color="#DC2626" style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#991B1B' }}>
                    {paymentsError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchPaymentsData(false)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: '#DC2626',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Loading state indicator */}
              {isLoadingPayments && pendingPayments.length === 0 && (
                <View
                  style={{
                    paddingVertical: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#F57C00" />
                  <Text style={{ marginTop: 10, fontSize: 13.5, color: '#64748B', fontWeight: '600' }}>
                    Loading pending payment reviews...
                  </Text>
                </View>
              )}

              {/* Payment Items List */}
              {filteredPayments.length === 0 && (!isLoadingPayments || pendingPayments.length > 0) ? (
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <Ionicons name="checkmark-done-circle-outline" size={54} color="#10B981" />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#1E293B',
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  >
                    All caught up!
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                    No payments in this category.
                  </Text>
                </View>
              ) : (
                filteredPayments.map((p) => {
                  const isOnline = p.type === 'online';
                  const isPending = p.status === 'pending';

                  return (
                    <View
                      key={p.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 22,
                        padding: 16,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: isOnline ? '#E0E7FF' : '#FEF3C7',
                        borderLeftWidth: 5,
                        borderLeftColor: isOnline ? '#3B82F6' : '#F59E0B',
                        shadowColor: '#0F172A',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {/* Top Header Row: Room & Type Badges (Left) + Amount Stack (Right) */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        {/* Left: Badges */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                            marginRight: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          {/* Room Badge */}
                          <View
                            style={{
                              backgroundColor: '#FFF7ED',
                              paddingHorizontal: 9,
                              paddingVertical: 4,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#FED7AA',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>
                              Room {p.room}
                            </Text>
                          </View>

                          {/* Type Badge */}
                          {isOnline ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#EFF6FF',
                                paddingHorizontal: 9,
                                paddingVertical: 4,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#DBEAFE',
                                gap: 4,
                              }}
                            >
                              <Ionicons name="card" size={12} color="#2563EB" />
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#1D4ED8' }}>
                                Online UPI
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FEF3C7',
                                paddingHorizontal: 9,
                                paddingVertical: 4,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#FDE68A',
                                gap: 4,
                              }}
                            >
                              <Ionicons name="cash" size={12} color="#D97706" />
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#B45309' }}>
                                Cash Handover
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Right: Amount Display (No collision) */}
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              color: '#94A3B8',
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                              marginBottom: 1,
                            }}
                          >
                            {!isPending ? 'APPROVED' : isOnline ? 'REQUESTED' : 'DECLARED'}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: '900',
                              color: !isPending ? '#16A34A' : '#0F172A',
                              letterSpacing: -0.4,
                            }}
                          >
                            {p.verifiedAmount || p.amount}
                          </Text>
                        </View>
                      </View>

                      {/* Resident Info Row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isOnline ? '#EFF6FF' : '#FEF3C7',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                            borderWidth: 1,
                            borderColor: isOnline ? '#DBEAFE' : '#FDE68A',
                          }}
                        >
                          <Ionicons
                            name={isOnline ? 'phone-portrait-outline' : 'wallet-outline'}
                            size={18}
                            color={isOnline ? '#2563EB' : '#D97706'}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15.5,
                              fontWeight: '700',
                              color: '#0F172A',
                            }}
                            numberOfLines={1}
                          >
                            {p.resident}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 5 }}>
                            <Text style={{ fontSize: 12, color: '#64748B' }}>
                              {p.method}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#CBD5E1' }}>•</Text>
                            <Ionicons name="time-outline" size={12} color="#94A3B8" />
                            <Text style={{ fontSize: 12, color: '#64748B' }}>
                              {p.date}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Detail / Reference Box (Differentiated for Online vs Cash) */}
                      {isOnline ? (
                        <View
                          style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Ionicons name="receipt-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#64748B' }} numberOfLines={1}>
                              Ref / UTR: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{p.refId}</Text>
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {p.screenshotUrl ? (
                              <TouchableOpacity
                                onPress={() => setViewingProof(p)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 6,
                                  backgroundColor: '#EFF6FF',
                                  borderWidth: 1,
                                  borderColor: '#BFDBFE',
                                  gap: 3,
                                }}
                              >
                                <Ionicons name="image-outline" size={12} color="#2563EB" />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>Proof</Text>
                              </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                              onPress={() => handleCopyRef(p.refId)}
                              activeOpacity={0.7}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 7,
                                paddingVertical: 4,
                                borderRadius: 6,
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: '#CBD5E1',
                                gap: 3,
                              }}
                            >
                              <Ionicons name="copy-outline" size={11} color="#475569" />
                              <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#475569' }}>Copy</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#FFFBEB',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#FEF3C7',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Ionicons name="location-outline" size={15} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#92400E' }} numberOfLines={1}>
                              Handover: <Text style={{ fontWeight: '700', color: '#78350F' }}>{p.refId}</Text>
                            </Text>
                          </View>
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              backgroundColor: '#FEF3C7',
                            }}
                          >
                            <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#B45309' }}>
                              Security Desk
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Card Bottom: Pending Actions or Verified Banner */}
                      {isPending ? (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            onPress={() => handleRejectPayment(p.id)}
                            disabled={isSubmittingAction}
                            activeOpacity={0.7}
                            style={{
                              flex: 1,
                              paddingVertical: 11,
                              borderRadius: 12,
                              backgroundColor: '#FEF2F2',
                              borderWidth: 1,
                              borderColor: '#FEE2E2',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              opacity: isSubmittingAction && actionLoadingId === p.id ? 0.6 : 1,
                            }}
                          >
                            {isSubmittingAction && actionLoadingId === p.id && actionType === 'reject' ? (
                              <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                              <>
                                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                                <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#DC2626' }}>
                                  Reject
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleOpenVerifyModal(p.id)}
                            disabled={isSubmittingAction}
                            activeOpacity={0.8}
                            style={{
                              flex: 2,
                              paddingVertical: 11,
                              borderRadius: 12,
                              backgroundColor: '#F57C00',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              shadowColor: '#F57C00',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 4,
                              elevation: 2,
                              opacity: isSubmittingAction ? 0.6 : 1,
                            }}
                          >
                            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                            <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#FFFFFF' }}>
                              Verify & Approve
                            </Text>
                            <Ionicons name="create-outline" size={14} color="#FFEDD5" style={{ marginLeft: 2 }} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#F0FDF4',
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#DCFCE7',
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                              <Text style={{ fontSize: 13, fontWeight: '700', color: '#15803D' }}>
                                Verified & Approved
                              </Text>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#16A34A' }}>
                              {p.verifiedAmount || p.amount}
                            </Text>
                          </View>
                          {p.originalAmount && p.originalAmount !== (p.verifiedAmount || p.amount) ? (
                            <Text style={{ fontSize: 11.5, color: '#15803D', marginTop: 3 }}>
                              Declared: {p.originalAmount} • Approved: {p.verifiedAmount || p.amount}
                            </Text>
                          ) : null}
                          {p.adminRemark ? (
                            <Text style={{ fontSize: 11.5, color: '#166534', marginTop: 2 }}>
                              Note: {p.adminRemark}
                            </Text>
                          ) : null}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* TAB 2: ROOMS */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={roomsScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshingRooms}
                  onRefresh={() => fetchRoomsAndResidentsData(true)}
                  tintColor="#F57C00"
                  colors={['#F57C00']}
                />
              }
            >
              {/* Header Title & Add Room Action */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                    Residency Units
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#64748B', marginTop: 1 }}>
                    {totalRoomsCount} Configured Units • {occupiedRoomsCount} Occupied
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setNewRoomNumber('');
                    setNewRoomIsExempt(false);
                    setCreateRoomModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F57C00',
                    paddingHorizontal: 13,
                    paddingVertical: 8,
                    borderRadius: 12,
                    gap: 5,
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Add Room</Text>
                </TouchableOpacity>
              </View>

              {/* Error Notice Banner */}
              {roomsError && liveRooms.length === 0 && (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 14,
                    padding: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                  }}
                >
                  <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                  <Text style={{ flex: 1, fontSize: 12.5, color: '#DC2626' }}>
                    {roomsError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchRoomsAndResidentsData(false)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: '#DC2626',
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
              >
                {[
                  { key: 'all', label: `All (${totalRoomsCount})` },
                  { key: 'occupied', label: `Occupied (${occupiedRoomsCount})` },
                  { key: 'vacant', label: `Vacant (${vacantRoomsCount})` },
                  { key: 'exempt', label: `Exempt (${exemptRoomsCount})` },
                ].map((f) => {
                  const isActive = roomFilter === f.key;
                  return (
                    <TouchableOpacity
                      key={f.key}
                      onPress={() => setRoomFilter(f.key)}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 13,
                        paddingVertical: 7,
                        borderRadius: 18,
                        backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isActive ? '#0F172A' : '#E2E8F0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? '#FFFFFF' : '#64748B',
                        }}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Search Bar */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search room number or resident name..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1, fontSize: 14, color: '#0F172A' }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Loading Indicator */}
              {isLoadingRooms && liveRooms.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color="#F57C00" />
                  <Text style={{ marginTop: 12, fontSize: 13.5, color: '#64748B', fontWeight: '500' }}>
                    Loading residency rooms & accounts...
                  </Text>
                </View>
              ) : filteredRooms.length === 0 ? (
                /* Empty State */
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    marginTop: 8,
                  }}
                >
                  <MaterialCommunityIcons name="door-open" size={44} color="#CBD5E1" />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 }}>
                    No Rooms Found
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#64748B',
                      textAlign: 'center',
                      marginTop: 4,
                      marginBottom: 14,
                    }}
                  >
                    {searchQuery.trim().length > 0
                      ? `No rooms match "${searchQuery}".`
                      : 'No units found in this category.'}
                  </Text>
                  {(searchQuery.length > 0 || roomFilter !== 'all') && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery('');
                        setRoomFilter('all');
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: '#FFF7ED',
                        borderWidth: 1,
                        borderColor: '#FED7AA',
                      }}
                    >
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#F57C00' }}>
                        Clear Filters
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                /* Rooms List */
                filteredRooms.map((r, idx) => (
                  <TouchableOpacity
                    key={`room-${r.id ?? r.roomNumber ?? idx}`}
                    onPress={() => setSelectedRoomDetail(r)}
                    activeOpacity={0.75}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      padding: 15,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#F1F5F9',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.02,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          backgroundColor: r.isExempt ? '#F3E8FF' : '#FFF7ED',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          borderWidth: 1,
                          borderColor: r.isExempt ? '#E9D5FF' : '#FED7AA',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '800',
                            color: r.isExempt ? '#9333EA' : '#F57C00',
                          }}
                        >
                          {r.roomNumber}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: '700',
                              color: r.isOccupied ? '#0F172A' : '#94A3B8',
                            }}
                            numberOfLines={1}
                          >
                            {r.resident || 'Vacant Unit'}
                          </Text>
                          {r.isExempt && (
                            <Ionicons name="shield-checkmark" size={13} color="#9333EA" />
                          )}
                        </View>
                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {r.phone ? `+91 ${r.phone}` : 'No resident registered'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
                      <View style={{ alignItems: 'flex-end' }}>
                        {r.isExempt ? (
                          <StatusTag label="Exempt" variant="purple" size="sm" />
                        ) : r.isOccupied ? (
                          <StatusTag
                            label={r.status === 'paid' ? 'Paid' : r.status === 'pending' ? 'Pending' : 'Active'}
                            variant={r.status === 'paid' ? 'green' : 'orange'}
                            size="sm"
                          />
                        ) : (
                          <StatusTag label="Available" variant="gray" size="sm" />
                        )}
                        {r.dues !== '₹0' && !r.isExempt && (
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#DC2626', marginTop: 3 }}>
                            Dues: {r.dues}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={17} color="#CBD5E1" style={{ alignSelf: 'center' }} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* TAB 3: PROFILE */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={profileScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Card */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 22,
                  padding: 20,
                  alignItems: 'center',
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: '#F57C00',
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={require('../assets/admin-avatar.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                  Residency Administrator
                </Text>
                <Text style={{ fontSize: 13.5, color: '#64748B', marginTop: 2, marginBottom: 10 }}>
                  {user?.mobileNumber ? `+91 ${user.mobileNumber}` : 'admin@radhika-residency.com'}
                </Text>
                <StatusTag label="Super Admin" variant="orange" />
              </View>

              {/* Action Items */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                <TouchableOpacity
                  onPress={onChangePassword}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <Ionicons name="key-outline" size={20} color="#F57C00" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                    Change Password
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setNotificationsVisible(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#F57C00"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                    Notifications & Alerts
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {onNavigateResident ? (
                  <TouchableOpacity
                    onPress={onNavigateResident}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F1F5F9',
                    }}
                  >
                    <Ionicons
                      name="home-outline"
                      size={20}
                      color="#F57C00"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                      Switch to Resident Dashboard
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={handleLogoutConfirm}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#DC2626' }}>
                    Log Out
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              maxHeight: '75%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                Admin Notifications
              </Text>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12, marginBottom: 20 }}>
                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#FFF7ED',
                    borderLeftWidth: 4,
                    borderLeftColor: '#F57C00',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#9A3412' }}>
                    {onlinePendingCount} Online Payments Pending Review
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#C2410C', marginTop: 2 }}>
                    Residents submitted UPI receipts for October maintenance.
                  </Text>
                </View>

                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#FEF3C7',
                    borderLeftWidth: 4,
                    borderLeftColor: '#D97706',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>
                    {cashPendingCount} Cash Payment Requests
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#B45309', marginTop: 2 }}>
                    Cash handed over at security booth awaiting verification.
                  </Text>
                </View>

                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#DCFCE7',
                    borderLeftWidth: 4,
                    borderLeftColor: '#16A34A',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>
                    October Collection Milestone
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#15803D', marginTop: 2 }}>
                    45% target reached (₹18,000 collected so far).
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        visible={Boolean(selectedActivity)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#DCFCE7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name="checkmark-circle" size={34} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 19, fontWeight: '800', color: '#0F172A' }}>
                Payment Verified
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#16A34A', marginTop: 4 }}>
                {selectedActivity?.amount}
              </Text>
            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 10, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Room</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.room}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Resident</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.resident}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Method</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.mode}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Date & Time</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.date}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedActivity(null)}
              style={{
                backgroundColor: '#F57C00',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verify & Custom Amount Modal */}
      <Modal
        visible={Boolean(verifyModalItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setVerifyModalItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: verifyModalItem?.type === 'online' ? '#EFF6FF' : '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={verifyModalItem?.type === 'online' ? 'card' : 'cash'}
                    size={22}
                    color={verifyModalItem?.type === 'online' ? '#2563EB' : '#D97706'}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                    Verify Payment
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                    Room {verifyModalItem?.room} • {verifyModalItem?.resident}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setVerifyModalItem(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Payment Details Summary Card */}
              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 18,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Payment Mode</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                    {verifyModalItem?.method}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                    {verifyModalItem?.type === 'online' ? 'Ref / UTR' : 'Handover Note'}
                  </Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                    {verifyModalItem?.refId}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Declared / Requested</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#EA580C' }}>
                    {verifyModalItem?.amount}
                  </Text>
                </View>

                {verifyModalItem?.screenshotUrl ? (
                  <TouchableOpacity
                    onPress={() => setViewingProof(verifyModalItem)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                      backgroundColor: '#EFF6FF',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#DBEAFE',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <Ionicons name="image-outline" size={16} color="#2563EB" />
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#1D4ED8' }}>
                      View Submitted Receipt / Proof
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Maintenance Allocation Selection */}
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1E293B' }}>
                    Maintenance Allocation
                  </Text>
                  {verifyModalItem?.type === 'cash' ? (
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>
                        Required for Cash
                      </Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                        Optional Allocation
                      </Text>
                    </View>
                  )}
                </View>

                {isLoadingRoomMaintenance ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
                    <ActivityIndicator size="small" color="#F57C00" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                      Loading maintenance records for Room {verifyModalItem?.room}...
                    </Text>
                  </View>
                ) : roomMaintenanceRecords.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {roomMaintenanceRecords.map((rec, idx) => {
                      const isSelected = selectedMaintenanceId === rec.id;
                      const dueNum = Number(rec.remainingBalance || 0);
                      const totalNum = Number(rec.totalAmount || 0);
                      const monthLabel = rec.billingMonth
                        ? new Date(rec.billingMonth).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                        : `Record #${rec.id}`;

                      return (
                        <TouchableOpacity
                          key={`maint-${rec.id ?? idx}`}
                          onPress={() => setSelectedMaintenanceId(isSelected && verifyModalItem?.type !== 'cash' ? null : rec.id)}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                            borderWidth: 1.5,
                            borderColor: isSelected ? '#F57C00' : '#E2E8F0',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={isSelected ? '#F57C00' : '#94A3B8'}
                            />
                            <View>
                              <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? '#C2410C' : '#0F172A' }}>
                                {monthLabel} Maintenance
                              </Text>
                              <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                                Total: ₹{totalNum.toLocaleString('en-IN')} • Due: ₹{dueNum.toLocaleString('en-IN')}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              backgroundColor: dueNum > 0 ? '#FEE2E2' : '#DCFCE7',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10.5,
                                fontWeight: '700',
                                color: dueNum > 0 ? '#DC2626' : '#16A34A',
                              }}
                            >
                              {dueNum > 0 ? `₹${dueNum.toLocaleString('en-IN')} DUE` : 'CLEARED'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                      No maintenance bills registered for Room {verifyModalItem?.room}.
                    </Text>
                    {verifyModalItem?.type === 'cash' ? (
                      <Text style={{ fontSize: 11.5, color: '#DC2626', fontWeight: '600', marginTop: 4 }}>
                        ⚠️ Cash payments require an existing maintenance record to allocate funds.
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>

              {/* Custom Approved Amount Input */}
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1E293B' }}>
                    Approved Amount (₹)
                  </Text>
                  <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#F57C00' }}>
                      {verifyModalItem?.type === 'cash' ? 'Must Match Declared' : 'Customizable'}
                    </Text>
                  </View>
                </View>

                {/* Big Input Box */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: '#F57C00',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 26, fontWeight: '800', color: '#F57C00', marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    editable={!isSubmittingAction}
                    style={{
                      flex: 1,
                      fontSize: 26,
                      fontWeight: '800',
                      color: '#0F172A',
                      padding: 0,
                    }}
                  />
                  {customAmount.length > 0 && !isSubmittingAction && (
                    <TouchableOpacity onPress={() => setCustomAmount('')}>
                      <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Quick Presets */}
                {(() => {
                  const origNum = parseInt(verifyModalItem?.amount?.replace(/[^0-9]/g, '') || '1500', 10);
                  const halfNum = Math.floor(origNum / 2);
                  const rawPresets = [
                    { id: 'preset-full', label: `Full (₹${origNum.toLocaleString('en-IN')})`, val: String(origNum) },
                    ...(halfNum > 0 && halfNum !== origNum ? [{ id: 'preset-half', label: `Half (₹${halfNum.toLocaleString('en-IN')})`, val: String(halfNum) }] : []),
                    { id: 'preset-500', label: '₹500', val: '500' },
                    { id: 'preset-1000', label: '₹1,000', val: '1000' },
                  ];

                  // Deduplicate by amount value so no redundant buttons appear (e.g. if origNum is 500 or 1000)
                  const seenVals = new Set();
                  const presets = rawPresets.filter((pr) => {
                    if (seenVals.has(pr.val)) return false;
                    seenVals.add(pr.val);
                    return true;
                  });

                  return (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {presets.map((pr) => {
                        const isSelected = customAmount === pr.val;
                        return (
                          <TouchableOpacity
                            key={pr.id}
                            disabled={isSubmittingAction}
                            onPress={() => setCustomAmount(pr.val)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 14,
                              backgroundColor: isSelected ? '#F57C00' : '#F1F5F9',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '700',
                                color: isSelected ? '#FFFFFF' : '#475569',
                              }}
                            >
                              {pr.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })()}

                {/* Helper notice */}
                {(() => {
                  const origNum = parseInt(verifyModalItem?.amount?.replace(/[^0-9]/g, '') || '0', 10);
                  const curNum = parseInt(customAmount.replace(/[^0-9]/g, '') || '0', 10);

                  if (curNum > 0 && curNum < origNum) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#FFFBEB',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#FEF3C7',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '600' }}>
                          ⚠️ Partial verification: ₹{(origNum - curNum).toLocaleString('en-IN')} will remain as pending dues for Room {verifyModalItem?.room}.
                        </Text>
                      </View>
                    );
                  }
                  if (curNum > 0 && curNum > origNum) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#EFF6FF',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#DBEAFE',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                          ✓ Extra amount of ₹{(curNum - origNum).toLocaleString('en-IN')} will be recorded as advance maintenance credit.
                        </Text>
                      </View>
                    );
                  }
                  if (curNum === origNum && origNum > 0) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#F0FDF4',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#DCFCE7',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#15803D', fontWeight: '600' }}>
                          ✓ Exact full amount will be approved and credited to maintenance balance.
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>

              {/* Admin Remarks */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                  Verification Note / Remarks
                </Text>
                <TextInput
                  placeholder="e.g., Verified in bank statement / Cash received at security"
                  placeholderTextColor="#94A3B8"
                  value={adminRemarks}
                  onChangeText={setAdminRemarks}
                  editable={!isSubmittingAction}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    fontSize: 13.5,
                    color: '#0F172A',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {['Full payment verified', 'Partial cash received', 'Verified in bank statement'].map((rem) => (
                    <TouchableOpacity
                      key={rem}
                      disabled={isSubmittingAction}
                      onPress={() => setAdminRemarks(rem)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: '#F8FAFC',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#64748B' }}>{rem}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Modal Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setVerifyModalItem(null)}
                  disabled={isSubmittingAction}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSubmittingAction ? 0.6 : 1,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmVerification}
                  disabled={isSubmittingAction}
                  style={{
                    flex: 2,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: '#F57C00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                    opacity: isSubmittingAction ? 0.7 : 1,
                  }}
                >
                  {isSubmittingAction ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#FFFFFF' }}>
                      Approve ₹{customAmount || '0'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Proof Viewer Modal */}
      <Modal
        visible={Boolean(viewingProof)}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingProof(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              width: '100%',
              maxWidth: 420,
              maxHeight: '85%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                  Payment Proof
                </Text>
                <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                  Room {viewingProof?.room} • {viewingProof?.amount}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setViewingProof(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}>
              {viewingProof?.screenshotUrl ? (
                <Image
                  source={{ uri: viewingProof.screenshotUrl }}
                  style={{
                    width: '100%',
                    height: 280,
                    borderRadius: 14,
                    backgroundColor: '#F1F5F9',
                  }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 180,
                    borderRadius: 14,
                    backgroundColor: '#F8FAFC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Ionicons name="image-outline" size={48} color="#94A3B8" />
                  <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
                    No image screenshot provided
                  </Text>
                </View>
              )}

              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 14,
                  padding: 12,
                  width: '100%',
                  marginTop: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>Transaction / UTR Reference</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 }}>
                    {viewingProof?.refId || 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopyRef(viewingProof?.refId)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    gap: 4,
                  }}
                >
                  <Ionicons name="copy-outline" size={13} color="#475569" />
                  <Text style={{ fontSize: 11.5, fontWeight: '600', color: '#475569' }}>Copy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setViewingProof(null)}
              style={{
                backgroundColor: '#F57C00',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ROOM DETAIL & RESIDENT MANAGEMENT MODAL */}
      <Modal
        visible={selectedRoomDetail !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRoomDetail(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom + 12, 24),
              maxHeight: '85%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: selectedRoomDetail?.isExempt ? '#F3E8FF' : '#FFF7ED',
                    borderWidth: 1,
                    borderColor: selectedRoomDetail?.isExempt ? '#E9D5FF' : '#FED7AA',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: selectedRoomDetail?.isExempt ? '#9333EA' : '#F57C00',
                    }}
                  >
                    Room {selectedRoomDetail?.roomNumber}
                  </Text>
                </View>
                {selectedRoomDetail?.isExempt ? (
                  <StatusTag label="Maintenance Exempt" variant="purple" size="sm" />
                ) : (
                  <StatusTag
                    label={selectedRoomDetail?.isOccupied ? 'Occupied' : 'Vacant'}
                    variant={selectedRoomDetail?.isOccupied ? 'green' : 'gray'}
                    size="sm"
                  />
                )}
              </View>

              <TouchableOpacity
                onPress={() => setSelectedRoomDetail(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Resident Information Section */}
              <View style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 8,
                  }}
                >
                  Resident Account
                </Text>

                {selectedRoomDetail?.residentData ? (
                  <View
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#FFF7ED',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          borderWidth: 1,
                          borderColor: '#FED7AA',
                        }}
                      >
                        <Ionicons name="person" size={22} color="#F57C00" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
                          {selectedRoomDetail.residentData.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', marginTop: 1 }}>
                          +91 {selectedRoomDetail.residentData.mobileNumber}
                        </Text>
                      </View>
                      <StatusTag label={selectedRoomDetail.residentData.status || 'ACTIVE'} variant="green" size="sm" />
                    </View>

                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#F1F5F9',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>Account Role</Text>
                        <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                          {selectedRoomDetail.residentData.role || 'RESIDENT'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>User Account ID</Text>
                        <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                          #{selectedRoomDetail.residentData.id}
                        </Text>
                      </View>
                    </View>

                    {/* Reset Password Button */}
                    <TouchableOpacity
                      onPress={() => handleResetPassword(selectedRoomDetail.residentData)}
                      disabled={isResettingPassword}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#FFF1F2',
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#FECDD3',
                        gap: 8,
                        opacity: isResettingPassword ? 0.6 : 1,
                      }}
                    >
                      {isResettingPassword ? (
                        <ActivityIndicator size="small" color="#E11D48" />
                      ) : (
                        <>
                          <Ionicons name="key-outline" size={17} color="#E11D48" />
                          <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#E11D48' }}>
                            Reset Resident Password
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: 18,
                      padding: 18,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <MaterialCommunityIcons name="account-off-outline" size={36} color="#94A3B8" />
                    <Text style={{ fontSize: 14.5, fontWeight: '700', color: '#334155', marginTop: 8 }}>
                      No Registered Resident
                    </Text>
                    <Text
                      style={{
                        fontSize: 12.5,
                        color: '#64748B',
                        textAlign: 'center',
                        marginTop: 4,
                        lineHeight: 18,
                      }}
                    >
                      Room {selectedRoomDetail?.roomNumber} is currently vacant. A new resident can register using this room number during sign up.
                    </Text>
                  </View>
                )}
              </View>

              {/* Maintenance Exemption Policy Section */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 8,
                  }}
                >
                  Maintenance Policy
                </Text>

                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 18,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Ionicons
                      name={selectedRoomDetail?.isExempt ? 'shield-checkmark' : 'shield-outline'}
                      size={20}
                      color={selectedRoomDetail?.isExempt ? '#9333EA' : '#64748B'}
                      style={{ marginRight: 10, marginTop: 1 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                        {selectedRoomDetail?.isExempt ? 'Maintenance Exempt Unit' : 'Standard Maintenance Unit'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 17 }}>
                        {selectedRoomDetail?.isExempt
                          ? 'This room is exempt from monthly maintenance charges (e.g. Society office, guest suite, or Room 207).'
                          : 'Monthly maintenance charges are automatically billed to this room based on society configuration.'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggleExemption(selectedRoomDetail)}
                    disabled={isTogglingExemption}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selectedRoomDetail?.isExempt ? '#FAF5FF' : '#F1F5F9',
                      paddingVertical: 11,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selectedRoomDetail?.isExempt ? '#E9D5FF' : '#CBD5E1',
                      gap: 6,
                      opacity: isTogglingExemption ? 0.6 : 1,
                    }}
                  >
                    {isTogglingExemption ? (
                      <ActivityIndicator size="small" color="#64748B" />
                    ) : (
                      <>
                        <Ionicons
                          name={selectedRoomDetail?.isExempt ? 'close-circle-outline' : 'shield-checkmark-outline'}
                          size={16}
                          color={selectedRoomDetail?.isExempt ? '#9333EA' : '#475569'}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: selectedRoomDetail?.isExempt ? '#9333EA' : '#475569',
                          }}
                        >
                          {selectedRoomDetail?.isExempt ? 'Remove Exemption' : 'Mark as Maintenance Exempt'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setSelectedRoomDetail(null)}
              style={{
                backgroundColor: '#0F172A',
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PASSWORD RESET RESULT MODAL */}
      <Modal
        visible={resetResult !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setResetResult(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#DCFCE7',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 2,
                borderColor: '#BBF7D0',
              }}
            >
              <Ionicons name="key" size={28} color="#16A34A" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
              Temporary Password Generated
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
              Generated for {resetResult?.userName} (Room {resetResult?.roomNumber})
            </Text>

            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#FED7AA',
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: 'center',
                width: '100%',
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                Temporary Password
              </Text>
              <TextInput
                value={resetResult?.temporaryPassword || ''}
                editable={false}
                selectTextOnFocus
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: '#EA580C',
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              />
            </View>

            <View
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FEF3C7',
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Ionicons name="information-circle" size={17} color="#D97706" style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 11.5, color: '#92400E', lineHeight: 16 }}>
                Share this password with the resident securely. They must choose a new password upon login. For safety, this temporary password will not be shown again.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setResetResult(null)}
              style={{
                backgroundColor: '#F57C00',
                borderRadius: 14,
                paddingVertical: 13,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE ROOM MODAL */}
      <Modal
        visible={createRoomModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!isCreatingRoom) setCreateRoomModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: Math.max(insets.bottom + 12, 24),
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                    Add New Room
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#64748B', marginTop: 1 }}>
                    Configure a new unit for Radhika Residency
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCreateRoomModalVisible(false)}
                  disabled={isCreatingRoom}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Room Number Input */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
                  Room Number *
                </Text>
                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="business-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="e.g. 501"
                    placeholderTextColor="#94A3B8"
                    value={newRoomNumber}
                    onChangeText={setNewRoomNumber}
                    maxLength={10}
                    autoCapitalize="characters"
                    style={{ flex: 1, fontSize: 15, color: '#0F172A', fontWeight: '600' }}
                  />
                </View>
              </View>

              {/* Maintenance Exemption Checkbox */}
              <TouchableOpacity
                onPress={() => setNewRoomIsExempt(!newRoomIsExempt)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: newRoomIsExempt ? '#FAF5FF' : '#F8FAFC',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: newRoomIsExempt ? '#E9D5FF' : '#E2E8F0',
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  gap: 12,
                }}
              >
                <Ionicons
                  name={newRoomIsExempt ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={newRoomIsExempt ? '#9333EA' : '#94A3B8'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
                    Maintenance Exempt Unit
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                    Check if this room should not be charged monthly maintenance fees (e.g. society office or Room 207).
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setCreateRoomModalVisible(false)}
                  disabled={isCreatingRoom}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 14,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateRoom}
                  disabled={isCreatingRoom || !newRoomNumber.trim()}
                  style={{
                    flex: 2,
                    paddingVertical: 13,
                    borderRadius: 14,
                    backgroundColor: '#F57C00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isCreatingRoom || !newRoomNumber.trim() ? 0.6 : 1,
                  }}
                >
                  {isCreatingRoom ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Create Room</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Animated Bottom Navigation Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10),
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          onPress={() => handleTabPress('dashboard')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.dashboard }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'dashboard' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'dashboard' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'dashboard' ? '700' : '500',
                color: activeTab === 'dashboard' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Dashboard
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 2: Payments */}
        <TouchableOpacity
          onPress={() => handleTabPress('payments')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.payments }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'payments' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'payments' ? 'receipt' : 'receipt-outline'}
              size={22}
              color={activeTab === 'payments' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'payments' ? '700' : '500',
                color: activeTab === 'payments' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Payments
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 3: Rooms */}
        <TouchableOpacity
          onPress={() => handleTabPress('rooms')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.rooms }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'rooms' ? '#FFF7ED' : 'transparent',
            }}
          >
            <MaterialCommunityIcons
              name={activeTab === 'rooms' ? 'door-open' : 'door-closed'}
              size={22}
              color={activeTab === 'rooms' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'rooms' ? '700' : '500',
                color: activeTab === 'rooms' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Rooms
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          onPress={() => handleTabPress('profile')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.profile }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'profile' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={activeTab === 'profile' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'profile' ? '700' : '500',
                color: activeTab === 'profile' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Profile
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
