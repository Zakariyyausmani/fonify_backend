const Listing = require('../../models/Listing');
const ActivityLog = require('../../models/ActivityLog');

exports.bulkUpdateListings = async (req, res) => {
  try {
    const { listingIds, action, values } = req.body;
    // action could be 'updateStatus', 'feature', 'delete'
    // listingIds: array of listing IDs
    // values: object with new values if applicable (e.g., { status: 'approved' })

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No listing IDs provided for bulk action' });
    }

    if (!action) {
       return res.status(400).json({ success: false, message: 'No action specified' });
    }

    let modifiedCount = 0;

    if (action === 'updateStatus') {
      const result = await Listing.updateMany(
        { _id: { $in: listingIds } },
        { $set: { status: values.status } }
      );
      modifiedCount = result.modifiedCount;
      
      // Log Activity
      await ActivityLog.create({
        adminId: req.user._id,
        action: 'bulk_update_listing_status',
        targetType: 'Listing',
        targetId: listingIds[0], // Just reference the first one, or use a new targetType 'MultipleListings'
        details: { count: listingIds.length, newStatus: values.status, listingIds }
      });
    } else if (action === 'feature') {
      const result = await Listing.updateMany(
        { _id: { $in: listingIds } },
        { $set: { isFeatured: values.isFeatured, featuredExpiry: values.featuredExpiry || null } }
      );
      modifiedCount = result.modifiedCount;
      
      await ActivityLog.create({
        adminId: req.user._id,
        action: 'bulk_feature_listings',
        targetType: 'Listing',
        targetId: listingIds[0], 
        details: { count: listingIds.length, isFeatured: values.isFeatured, listingIds }
      });
    } else if (action === 'delete') {
      const result = await Listing.deleteMany({ _id: { $in: listingIds } });
      modifiedCount = result.deletedCount;

      await ActivityLog.create({
        adminId: req.user._id,
        action: 'bulk_delete_listings',
        targetType: 'Listing',
        targetId: listingIds[0], 
        details: { count: listingIds.length, listingIds }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action specified' });
    }

    res.status(200).json({
      success: true,
      message: `Successfully performed bulk ${action}`,
      modifiedCount
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
